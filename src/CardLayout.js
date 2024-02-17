import React from "react";
import Card from "./Card";
import "./CardLayout.css";
import StockChart from "./StockChart";
import PredictedChart from "./PredictedChart";
import FreqDomainChart from "./FreqDomainChart";
import DominantFreqChart from "./DominantFreqChart";
import { ChakraProvider } from "@chakra-ui/react";
import { Input } from "@chakra-ui/react";
import { Heading } from "@chakra-ui/react";
import { Button, ButtonGroup } from "@chakra-ui/react";
import { Flex } from "@chakra-ui/react";
import { ArrowForwardIcon } from "@chakra-ui/icons";

const CardLayout = ({
  ticker,
  setTicker,
  onGetData,
  stockData,
  stockName,
  freqData,
  DomFreqData,
  predictedData,
}) => {
  return (
    <ChakraProvider>
      <div className="card-layout">
        <Card>
          <Heading as="h1">Fourier Stocks</Heading>
          <Flex justifyContent="center">
            <Input
              width="300px"
              placeholder="Enter Ticker Symbol"
              size="lg"
              value={ticker}
              color="black"
              textAlign="center"
              _placeholder={{
                opacity: 0.4,
                color: "inherit",
                textAlign: "center",
              }}
              onChange={(e) => setTicker(e.target.value)}
            />
          </Flex>
          {/* <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            placeholder="Enter Ticker Symbol"
          /> */}
          <Flex justifyContent="center">
            <Button
              size="md"
              width="150px"
              height="45px"
              textAlign="center"
              onClick={() => onGetData()}
              rightIcon={<ArrowForwardIcon />}
              colorScheme="pink"
              variant="solid"
            >
              Get Data
            </Button>
          </Flex>
          {/* <button onClick={() => onGetData()}>Get Data</button> */}
        </Card>
        {/* {stockData && (
          <Card>
            <StockChart
              stockData={JSON.parse(stockData)}
              stockName={stockName}
            />
          </Card>
        )} */}
        {freqData && (
          <Card>
            <FreqDomainChart freqData={JSON.parse(freqData)} />
          </Card>
        )}
        {DomFreqData && (
          <Card>
            <DominantFreqChart DomFreqData={JSON.parse(DomFreqData)} />
          </Card>
        )}
        {predictedData && stockData && (
          <Card>
            <PredictedChart
              predictedData={JSON.parse(predictedData)}
              stockData={JSON.parse(stockData)}
              stockName={stockName}
            />
          </Card>
        )}
      </div>
    </ChakraProvider>
  );
};

export default CardLayout;
