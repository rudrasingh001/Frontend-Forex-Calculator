import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [sourceValue, setSourceValue] = useState('');
  const [sourceCurrency, setSourceCurrency] = useState('INR');
  const [targetValue, setTargetValue] = useState('');
  const [targetCurrency, setTargetCurrency] = useState('USD');
  const [exchangeRates, setExchangeRates] = useState(null);
  const [dateTime, setDateTime] = useState('');
  const [exchangeRateInfo, setExchangeRateInfo] = useState('');

  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        const response = await axios.get('https://open.er-api.com/v6/latest');
        setExchangeRates(response.data.rates);
      } catch (error) {
        console.error('Error fetching exchange rates:', error.message);
      }
    };

    fetchExchangeRates();

    const updateTime = () => {
      const now = new Date();

      const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      const month = months[now.getMonth()];
      const date = now.getDate();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const amOrPm = hours >= 12 ? 'pm' : 'am';
      const formattedHours = hours % 12 || 12;
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

      const dateTimeString = `${date} ${month}, ${formattedHours}:${formattedMinutes} ${amOrPm}`;
      setDateTime(dateTimeString);
    };

    updateTime();

    const intervalId = setInterval(updateTime, 60000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (exchangeRates) {
      const rateInfo = `1 ${sourceCurrency} = ${(exchangeRates[targetCurrency] / exchangeRates[sourceCurrency]).toFixed(4)} ${targetCurrency}`;
      setExchangeRateInfo(rateInfo);
    }
  }, [sourceCurrency, targetCurrency, exchangeRates]);

  const handleSourceChange = (value) => {
    setSourceValue(value);
    convertCurrency(value, sourceCurrency, targetCurrency);
  };

  const handleTargetChange = (value) => {
    setTargetValue(value);
    convertCurrency(value, targetCurrency, sourceCurrency);
  };

  const convertCurrency = (amount, fromCurrency, toCurrency) => {
    if (exchangeRates) {
      const rate = exchangeRates[toCurrency] / exchangeRates[fromCurrency];
      const convertedAmount = (parseFloat(amount) * rate).toFixed(2);
      toCurrency === targetCurrency ? setTargetValue(convertedAmount) : setSourceValue(convertedAmount);
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Forex Calculator</h1>

      {/* Display exchange rate info */}
      <div className="exchange-rate-info">
        <p>{exchangeRateInfo}</p>
      </div>

      <div className="row">
        <div className="col-md-6">
          <label>Amount:</label>
          <div className="input-group mb-3">
            <input
              type="number"
              className="form-control"
              value={sourceValue}
              onChange={(e) => handleSourceChange(e.target.value)}
            />
            <select
              className="form-select"
              value={sourceCurrency}
              onChange={(e) => {
                setSourceCurrency(e.target.value);
                convertCurrency(sourceValue, e.target.value, targetCurrency);
              }}
            >
              {exchangeRates &&
                Object.keys(exchangeRates).map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
            </select>
          </div>
        </div>
        <div className="col-md-6">
          <label>Result:</label>
          <div className="input-group mb-3">
            <input
              type="text"
              className="form-control"
              value={targetValue}
              onChange={(e) => handleTargetChange(e.target.value)}
            />
            <select
              className="form-select"
              value={targetCurrency}
              onChange={(e) => {
                setTargetCurrency(e.target.value);
                convertCurrency(targetValue, sourceCurrency, e.target.value);
              }}
            >
              {exchangeRates &&
                Object.keys(exchangeRates).map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Display date and time */}
      <div className="datetime">
        <p id="date-time">{dateTime}</p>
      </div>
    </div>
  );
};

export default App;
