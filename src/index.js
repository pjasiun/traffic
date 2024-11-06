import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import styled from 'styled-components';

const Scene = styled.div`
  display: flex;
  align-items: center;
  padding: 20px;
  position: relative;
  gap: 30px;
`;

const TrafficLight = styled.div`
  width: 30px;
  height: 80px;
  background-color: #333;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5px;
`;

const Light = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin: 3px 0;
  background-color: gray;
`;

const CarContainer = styled.div`
  overflow: hidden;
  padding-top: 20px;
  height: 50px;
  width: 1500px;
  position: relative;
  background-color: #f0f0f0;
  border: 1px solid #333;
`;

const CarStyled = styled.div.attrs((props) => ({
  style: {
    width: `${props.width}px`,
    backgroundColor: props.color,
    right: `${props.$distance}px`,
  },
}))`
  height: 30px;
  border-radius: 3px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  position: absolute;
`;

const Wheels = styled.div`
  display: flex;
  justify-content: space-between;
  width: 80%;
  margin-bottom: -4px;
`;

const Wheel = styled.div`
  width: 8px;
  height: 8px;
  background-color: black;
  border-radius: 50%;
`;

const InfoBox = styled.div`
  background-color: #333;
  padding: 10px;
  border-radius: 5px;
`;

const InfoItem = styled.p`
  color: white;
  font-size: 16px;
  font-weight: bold;
  margin: 5px 0;
  font-family: 'Courier New', Courier, monospace;
`;

const Tutorial = styled.div`
  color: #333;
  position: fixed;
  bottom: 10px;
  right: 10px;
  font-size: 16px;
  font-weight: bold;
  font-family: 'Courier New', Courier, monospace;
`;

const Car = ({ color, width, distance }) => {
  return (
    <CarStyled color={color} width={width} $distance={distance}>
      <Wheels>
        <Wheel />
        <Wheel />
      </Wheels>
    </CarStyled>
  );
};

const Case = ({ initialGap, requireGap, reactionDelay }) => {
  const width = 50;
  const animationSpeed = 100;

  const createCars = () =>
    Array.from({ length: 50 }, (_, i) => ({
      color: `hsl(${(i * 12) % 360}, 80%, 60%)`,
      speed: 0,
      distance: i * (width + initialGap),
      acceleration: 1,
      reactionDelay,
      requireGap,
      width,
    }));

  const [lights, setLights] = useState({ red: true, yellow: false, green: false });
  const [cars, setCars] = useState(createCars());
  const [ticks, setTicks] = useState(0);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === 'Space') {
        setLights({ red: true, yellow: true, green: false });
      }
    };
    const handleKeyUp = (event) => {
      if (event.code === 'Space') {
        setLights({ red: false, yellow: false, green: true });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (lights.red) return;

      if (ticks % 50 > 45) {
        setLights({ red: false, yellow: true, green: false });
      }

      if ((ticks + 1) % 50 === 0) {
        setLights({ red: true, yellow: false, green: false });
        setTicks((prev) => prev + 1);
        return;
      }

      setTicks((prev) => prev + 1);

      setCars((prevCars) =>
        prevCars.map((car, index) => {
          const previousCar = prevCars[index - 1];
          const distanceFromPrevious = previousCar ? car.distance - previousCar.distance - previousCar.width : Infinity;

          if (distanceFromPrevious < car.requireGap) {
            return car;
          }

          if (car.reactionDelay > 0) {
            return {
              ...car,
              reactionDelay: car.reactionDelay - 1,
            };
          }
          return {
            ...car,
            distance: car.distance - car.speed,
            speed: car.speed + car.acceleration,
          };
        })
      );
    }, animationSpeed);

    return () => clearInterval(interval);
  }, [lights, ticks]);

  return (
    <Scene>
      <InfoBox>
        <InfoItem>Initial Gap: {initialGap} </InfoItem>
        <InfoItem>Require Gap: {requireGap} </InfoItem>
        <InfoItem>Reaction Delay: {reactionDelay} </InfoItem>
      </InfoBox>
      <CarContainer>
        {cars.map((car, index) => (
          <Car key={index} {...car} />
        ))}
      </CarContainer>
      <TrafficLight>
        <Light style={{ backgroundColor: lights.red ? 'red' : 'gray' }} />
        <Light style={{ backgroundColor: lights.yellow ? 'yellow' : 'gray' }} />
        <Light style={{ backgroundColor: lights.green ? 'green' : 'gray' }} />
      </TrafficLight>
      <InfoBox>
        <InfoItem>Cars Exited: {cars.filter((car) => car.distance < 0).length}</InfoItem>
        <InfoItem>Ticks: {ticks} </InfoItem>
      </InfoBox>
    </Scene>
  );
};

const cases = [
  {
    initialGap: 10,
    requireGap: 50,
    reactionDelay: 3,
  },
  {
    initialGap: 20,
    requireGap: 50,
    reactionDelay: 3,
  },
  {
    initialGap: 30,
    requireGap: 50,
    reactionDelay: 3,
  },
  {
    initialGap: 40,
    requireGap: 50,
    reactionDelay: 3,
  },
  {
    initialGap: 49,
    requireGap: 50,
    reactionDelay: 3,
  },

  {
    initialGap: 200,
    requireGap: 200,
    reactionDelay: 3,
  },
];

const App = () => {
  return (
    <>
      {cases.map((props, index) => (
        <Case key={index} {...props} />
      ))}
      <Tutorial>
        Press <span style={{ color: 'black' }}>Spacebar</span> to start simulation
      </Tutorial>
    </>
  );
};

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
