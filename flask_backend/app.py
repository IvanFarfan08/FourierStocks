from flask import Flask, jsonify, render_template
import numpy as np
import logging
import yfinance as yf
from flask_cors import CORS
from functools import lru_cache
import pandas as pd


app = Flask(__name__)
CORS(app)


@app.route('/getStockData/<ticker>')
def get_stock_data_route(ticker):
    try:
        data = get_stock_data(ticker)
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


def get_stock_data(ticker):
    # stock = yf.Ticker(ticker)
    # hist = stock.history(period="1mo")
    stock = yf.download(ticker, period="4y")
    hist = stock[['Close']]

    hist_json = hist.reset_index().to_json(date_format='iso', orient='records')
    return hist_json


@app.route('/getStockName/<ticker>')
def get_stock_name_route(ticker):
    data = get_stock_name(ticker)
    return data


def get_stock_name(ticker):
    stock = yf.Ticker(ticker)
    return stock.info['longName']


@app.route('/getFrequencyDom/<ticker>')
def get_frequency_dom_route(ticker):
    try:
        data = get_frequency_dom(ticker)
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


def get_frequency_dom(ticker):
    stock = yf.download(ticker, period="4y")
    # Add 0 at the beginining to match size
    stock['delta'] = np.append(np.array([0]), np.diff(stock['Close'].values))
    # Calculate our superposition values using FFT.
    sPosition = np.fft.fft(stock['delta'].values)
    # Calculate theta, amplitude and frequency.
    stock['theta'] = np.arctan(sPosition.imag / sPosition.real)
    numValues = len(stock)
    numValuesHalf = numValues / 2
    stock['amplitude'] = np.sqrt(
        sPosition.real**2 + sPosition.imag**2)/numValuesHalf
    stock['frequency'] = np.fft.fftfreq(sPosition.size, d=1)
    hist = stock[['frequency', 'amplitude']]
    hist_json = hist.to_json(date_format='iso', orient='records')
    return hist_json

# Confine analysis to only positive frequencies. Also remove the noise.
# More than 3 standard deviations from the mean is considered meaningful.


@app.route('/getDominantFreq/<ticker>')
def get_dominant_freq_route(ticker):
    try:
        data = get_dominant_freq(ticker)
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


def get_dominant_freq(ticker):
    stock = yf.download(ticker, period="4y")
    stock['delta'] = np.append(np.array([0]), np.diff(stock['Close'].values))
    sPosition = np.fft.fft(stock['delta'].values)
    stock['theta'] = np.arctan(sPosition.imag / sPosition.real)
    numValues = len(stock)
    numValuesHalf = numValues / 2
    stock['amplitude'] = np.sqrt(
        sPosition.real**2 + sPosition.imag**2)/numValuesHalf
    stock['frequency'] = np.fft.fftfreq(sPosition.size, d=1)
    meanAmplitude = stock['amplitude'].mean()
    stdAmplitude = stock['amplitude'].std()
    dominantAmpCheck = stock['amplitude'] > (3*stdAmplitude + meanAmplitude)
    dominantFreqCheck = stock['frequency'] > 0
    dominantData = stock[dominantAmpCheck & dominantFreqCheck][[
        'frequency', 'amplitude', 'theta']]
    hist = dominantData[['frequency', 'amplitude']]
    hist_json = hist.to_json(date_format='iso', orient='records')
    return hist_json


@app.route('/getPredictedData/<ticker>')
def get_prediction_route(ticker):
    try:
        data = get_prediction(ticker)
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


def get_prediction(ticker):
    # Using dominant frequency values we can predict stock prices.
    # We will perform cumsum on all the time deltas and add it to the initial adjusting closing stock value to perform a regression.
    stock = yf.download(ticker, period="4y")
    stock['delta'] = np.append(np.array([0]), np.diff(stock['Close'].values))
    sPosition = np.fft.fft(stock['delta'].values)
    stock['theta'] = np.arctan(sPosition.imag / sPosition.real)
    numValues = len(stock)
    numValuesHalf = numValues / 2
    stock['amplitude'] = np.sqrt(
        sPosition.real**2 + sPosition.imag**2)/numValuesHalf
    stock['frequency'] = np.fft.fftfreq(sPosition.size, d=1)
    meanAmplitude = stock['amplitude'].mean()
    stdAmplitude = stock['amplitude'].std()
    dominantAmpCheck = stock['amplitude'] > (3*stdAmplitude + meanAmplitude)
    dominantFreqCheck = stock['frequency'] > 0
    dominantData = stock[dominantAmpCheck & dominantFreqCheck][[
        'frequency', 'amplitude', 'theta']]

    regressionDelta = 0
    for n in range(len(dominantData['theta'])):
        shift = dominantData['theta'].iloc[n]
        regressionDelta += dominantData['theta'].iloc[n] * \
            np.cos(n * np.array(range(len(stock))) + shift)

    # Converting delta time to time at the start value of real data
    startValue = stock['Close'].iloc[0]
    regression = startValue + np.cumsum(regressionDelta)

    rmse = np.sqrt(np.mean((stock['Close'].values - regression)**2))

    def std_filter(std_value):
        # Getting dominant values based on std_value
        meanAmp = stock['amplitude'].mean()
        stdAmp = stock['amplitude'].std()
        dominantAmpCheck = stock['amplitude'] > (std_value*stdAmp + meanAmp)
        positiveFreqCheck = stock['frequency'] > 0
        dominantAmp = stock[dominantAmpCheck & positiveFreqCheck]['amplitude']
        dominantFreq = stock[dominantAmpCheck & positiveFreqCheck]['frequency']
        dominantTheta = stock[dominantAmpCheck & positiveFreqCheck]['theta']

        # Calculating Regression Delta
        regressionDelta = 0
        for n in range(len(dominantTheta)):
            shift = dominantTheta.iloc[n]
            regressionDelta += dominantAmp.iloc[n] * \
                np.cos(n * np.array(range(len(stock))) + shift)

        # Converting Delta Time to Time at start value of real data
        startValue = stock['Close'].iloc[0]
        regression = startValue - np.cumsum(regressionDelta)

        # Calculating RMSE
        rmse = np.sqrt(np.mean((stock['Close'].values - regression)**2))

        if np.isnan(rmse):
            rmse = 10000000000000

        return rmse

    std_values = []
    rmse_values = []

    for i in np.linspace(0, 2, 20):
        std_values.append(i)
        rmse_values.append(std_filter(i))

    idx = np.array(rmse_values).argmin()
    minSTD = std_values[idx]
    minRMSE = rmse_values[idx]

    meanAmp = stock['amplitude'].mean()
    stdAmp = stock['amplitude'].std()
    dominantAmpCheck = stock['amplitude'] > (minSTD*stdAmp + meanAmp)
    positiveFreqCheck = stock['frequency'] > 0
    dominantAmp = stock[dominantAmpCheck & positiveFreqCheck]['amplitude']
    dominantFreq = stock[dominantAmpCheck & positiveFreqCheck]['frequency']
    dominantTheta = stock[dominantAmpCheck & positiveFreqCheck]['theta']

    regressionDelta = 0
    for n in range(len(dominantTheta)):
        shift = dominantTheta.iloc[n]
        regressionDelta += dominantAmp.iloc[n] * \
            np.cos(n * np.array(range(len(stock))) + shift)

    startValue = stock['Close'].iloc[0]
    regression = startValue + np.cumsum(regressionDelta)

    # Convert the regression array into a DataFrame
    regression_df = pd.DataFrame(regression, columns=['Predicted'])

    # If you need to join this with the existing stock DataFrame index
    regression_df.index = stock.index

    # Now you can safely call reset_index()
    hist_json = regression_df.reset_index().to_json(
        date_format='iso', orient='records')
    return hist_json


if __name__ == '__main__':
    app.run(debug=True)
