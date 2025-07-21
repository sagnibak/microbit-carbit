STEERING_KEY = "steer"
SPEED_KEY = "speed"

def clip(val, lo, hi):
    if val < lo:
        return lo
    elif val > hi:
        return hi
    else:
        return val

class IoInterface:
    def setSteeringAngle(self, aAngle):
        raise NotImplementedError("setSteeringAngle not implemented")

    def setSpeed(self, aSpeed):
        raise NotImplementedError("setSpeed not implemented")


class MicrobitIo(IoInterface):
    STEERING_PIN = AnalogPin.P0
    SPEED_PIN = AnalogPin.P1

    def setSteeringAngle(self, aAngle):
        myClippedAngle = clip(aAngle, 0, 180)
        pins.servo_write_pin(MicrobitIo.STEERING_PIN, myClippedAngle)

        if myClippedAngle < 90:
            self._drawSteeringArrow(ArrowNames.WEST)
        elif myClippedAngle > 90:
            self._drawSteeringArrow(ArrowNames.EAST)
        else: # myClippedAngle == 90
            self._drawSteeringArrow(ArrowNames.NORTH)
    
    def setSpeed(self, aSpeed):
        myClippedSpeed = clip(aSpeed, 0, 180)
        pins.servo_write_pin(MicrobitIo.SPEED_PIN, myClippedSpeed)
        
        def toBarHeight(aClippedSpeed):
            return (aClippedSpeed - 90) // 22

        if myClippedSpeed < 90:
            self._drawSpeedBar(toBarHeight(myClippedSpeed))
        elif myClippedSpeed > 90:
            self._drawSpeedBar(toBarHeight(myClippedSpeed))
        else: # myClippedSpeed == 90
            self._drawSpeedBar(toBarHeight(myClippedSpeed))

    def _drawSteeringArrow(self, aDirection: ArrowNames):
        """
        ArrowNames.EAST:
        o o o o o
        o o o o o
        o o o # .
        o o o # #
        o o o # .

        ArrowNames.WEST:
        o o o o o
        o o o o o
        o o o . #
        o o o # #
        o o o . #

        ArrowNames.NORTH:
        o o o o o
        o o o o o
        o o o # #
        o o o # #
        o o o # #
        """
        for myX in range(3, 5):
            led.unplot(myX, 2)
            led.unplot(myX, 4)
        for myX in range(3, 5):
            led.plot(myX, 3)

        if aDirection == ArrowNames.EAST:
            led.plot(3, 2)
            led.plot(3, 4)
        elif aDirection == ArrowNames.WEST:
            led.plot(4, 2)
            led.plot(4, 4)
        elif aDirection == ArrowNames.NORTH:
            for myX in range(3, 5):
                led.plot(myX, 2)
                led.plot(myX, 4)
        else:
            for myX in range(3, 5):
                led.plot(myX, 3)
    
    
    def _drawSpeedBar(self, aBarHeight):
        """
        aBarHeight: int
            must be in range [-4, 4]
    
        Positive heights plotted from the bottom up, e.g., +3:
        . . o o o
        . . o o o
        # # o o o
        # # o o o
        # # o o o

        Negative heights plotted from the bottom up, e.g., -4:
        # # o o o
        # # o o o
        # # o o o
        # # o o o
        . . o o o
        """
        for myY in range(0, 5):
            led.unplot(0, myY)
            led.unplot(1, myY)

        if aBarHeight > 0:
            for myY in range(4, 4 - aBarHeight, -1):
                led.plot(0, myY)
                led.plot(1, myY)
        elif aBarHeight < 0:
            for myY in range(0, abs(aBarHeight)):
                led.plot(0, myY)
                led.plot(1, myY)


class ControllerDecoder:
    def __init__(self, aIo: IoInterface):
        self.io = aIo
    
    def decode(self, aKey, aVal):
        serial.write_line(f"Received {aKey} : {aVal}")
        if aKey == STEERING_KEY:
            self.io.setSteeringAngle(aVal)
        elif aKey == SPEED_KEY:
            self.io.setSpeed(aVal)
        else:
            raise RuntimeError(f"Received unknown key: {aKey}, with value {aVal}")


decoder = ControllerDecoder(MicrobitIo())

def on_received_value(name, value):
    decoder.decode(name, value)
    
radio.on_received_value(on_received_value)

def on_forever():
    pass
basic.forever(on_forever)