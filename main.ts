radio.onReceivedValue(function (name, value) {
    decoder.decode(name, value)
})
function clip (val: number, lo: number, hi: number) {
    if (val < lo) {
        return lo
    } else if (val > hi) {
        return hi
    } else {
        return val
    }
}
let STEERING_KEY = "steer"
let SPEED_KEY = "speed"
class IoInterface {
    public setSteeringAngle(aAngle: number) {
        control.fail("setSteeringAngle not implemented")
    }
    
    public setSpeed(aSpeed: number) {
        control.fail("setSpeed not implemented")
    }
    
}
class MicrobitIo extends IoInterface {
    static STEERING_PIN: number
    private ___STEERING_PIN_is_set: boolean
    private ___STEERING_PIN: number
    get STEERING_PIN(): number {
        return this.___STEERING_PIN_is_set ? this.___STEERING_PIN : MicrobitIo.STEERING_PIN
    }
    set STEERING_PIN(value: number) {
        this.___STEERING_PIN_is_set = true
        this.___STEERING_PIN = value
    }
    
    static SPEED_PIN: number
    private ___SPEED_PIN_is_set: boolean
    private ___SPEED_PIN: number
    get SPEED_PIN(): number {
        return this.___SPEED_PIN_is_set ? this.___SPEED_PIN : MicrobitIo.SPEED_PIN
    }
    set SPEED_PIN(value: number) {
        this.___SPEED_PIN_is_set = true
        this.___SPEED_PIN = value
    }
    
    public static __initMicrobitIo() {
        MicrobitIo.STEERING_PIN = AnalogPin.P0
        MicrobitIo.SPEED_PIN = AnalogPin.P1
    }
    
    public setSteeringAngle(aAngle: number) {
        let myClippedAngle = clip(aAngle, 0, 180)
        pins.servoWritePin(MicrobitIo.STEERING_PIN, myClippedAngle)
        if (myClippedAngle < 90) {
            this._drawSteeringArrow(ArrowNames.West)
        } else if (myClippedAngle > 90) {
            this._drawSteeringArrow(ArrowNames.East)
        } else {
            //  myClippedAngle == 90
            this._drawSteeringArrow(ArrowNames.North)
        }
        
    }
    
    public setSpeed(aSpeed: number) {
        let myClippedSpeed = clip(aSpeed, 0, 180)
        pins.servoWritePin(MicrobitIo.SPEED_PIN, myClippedSpeed)
        function toBarHeight(aClippedSpeed: number): number {
            return Math.idiv(aClippedSpeed - 90, 22)
        }
        
        if (myClippedSpeed < 90) {
            this._drawSpeedBar(toBarHeight(myClippedSpeed))
        } else if (myClippedSpeed > 90) {
            this._drawSpeedBar(toBarHeight(myClippedSpeed))
        } else {
            //  myClippedSpeed == 90
            this._drawSpeedBar(toBarHeight(myClippedSpeed))
        }
        
    }
    
    private _drawSteeringArrow(aDirection: number) {
        let myX: number;
        /** 
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
        
 */
        for (myX = 3; myX < 5; myX++) {
            led.unplot(myX, 2)
            led.unplot(myX, 4)
        }
        for (myX = 3; myX < 5; myX++) {
            led.plot(myX, 3)
        }
        if (aDirection == ArrowNames.East) {
            led.plot(3, 2)
            led.plot(3, 4)
        } else if (aDirection == ArrowNames.West) {
            led.plot(4, 2)
            led.plot(4, 4)
        } else if (aDirection == ArrowNames.North) {
            for (myX = 3; myX < 5; myX++) {
                led.plot(myX, 2)
                led.plot(myX, 4)
            }
        } else {
            for (myX = 3; myX < 5; myX++) {
                led.plot(myX, 3)
            }
        }
        
    }
    
    private _drawSpeedBar(aBarHeight: number) {
        /** 
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
        
 */
        for (let myX2 = 0; myX2 < 5; myX2++) {
            led.unplot(myX2, 0)
            led.unplot(myX2, 1)
        }
        if (aBarHeight > 0) {
            
        } else if (aBarHeight < 0) {
            
        }
        
    }
    
}
MicrobitIo.__initMicrobitIo()
class ControllerDecoder {
    io: IoInterface
    constructor(aIo: IoInterface) {
        this.io = aIo
    }
    
    public decode(aKey: string, aVal: number) {
        if (aKey == STEERING_KEY) {
            this.io.setSteeringAngle(aVal)
        } else if (aKey == SPEED_KEY) {
            this.io.setSpeed(aVal)
        } else {
            control.fail("Received unknown key: {aKey}, with value {aVal}")
        }
        
    }
    
}
let decoder = new ControllerDecoder(new MicrobitIo())
basic.forever(function () {
	
})
