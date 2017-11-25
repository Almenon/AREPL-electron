##############################################
#                SIMPLE CODE W/ IMPORT
##############################################

import json

x = 1
x = x+3
y = "a" + str(3)
z = [x*x for char in y]
zy = json.dumps(z)

##############################################
#                RANDOM STUFF
##############################################

def stair_case(c):
  print(c)
  if len(c) < 100:
  	return stair_case("o" + c)
  else: return c
  
# can you adjust stair case to show a pyramid?
  
def line(start, length):
  # find middle
  print(start)
  if len(start) > length:
   return start
  else:
    # play around with multiplier to adjust angle!
    return line(" "*2 + start, length)

line("a",50)

##############################################
#                SIMPLE CLASS
##############################################

class BankAccount(object):
    def __init__(self, initial_balance=0):
        self.balance = initial_balance
    def deposit(self, amount):
        self.balance += amount
    def withdraw(self, amount):
        self.balance -= amount
    def overdrawn(self):
        return self.balance < 0
my_account = BankAccount(15)
my_account.withdraw(5)
my_account.deposit(100)
my_account.withdraw(2000)
x = my_account.overdrawn()


# -{
#     "BankAccount": -{
#         "py/type": "__builtin__.BankAccount"
#     },
#     "my_account": -{
#         "py/object": "__builtin__.BankAccount",
#         "balance": -1890
#     },
#     "x": true
# }

##############################################
#                PANDAS
##############################################

import pandas as pd

headers = ['Group', 'Element', 'Case', 'Score', 'Evaluation']
data = [
    ['A', 1, 'x', 1.40, 0.59],
    ['A', 1, 'y', 9.19, 0.52],
    ['A', 2, 'x', 8.82, 0.80],
    ['A', 2, 'y', 7.18, 0.41],
    ['B', 1, 'x', 1.38, 0.22],
    ['B', 1, 'y', 7.14, 0.10],
    ['B', 2, 'x', 9.12, 0.28],
    ['B', 2, 'y', 4.11, 0.97],
]
df = pd.DataFrame(data, columns=headers)

result = (
    df.set_index(['Element', 'Case'])
    .groupby('Group')
    .agg({'Score': ['max', 'idxmax'], 'Evaluation': 'min'})
    .reset_index()
)
print(result) # print format is a bit wonky, but serviceable.

https://stackoverflow.com/questions/45133853/pandas-grouping-and-aggregation-with-multiple-functions



##############################################
#                SOCKETS (this behaves wierdly - maybe because it was meant for python 2?)
##############################################


import socket
import subprocess
import sys
from datetime import datetime

# Clear the screen
subprocess.call('clear', shell=True)

# Ask for input
remoteServer    = raw_input("Enter a remote host to scan: ")
remoteServerIP  = socket.gethostbyname(remoteServer)

# Print a nice banner with information on which host we are about to scan
print("-" * 60)
print("Please wait, scanning remote host", remoteServerIP)
print("-" * 60)

# Check what time the scan started
t1 = datetime.now()

# Using the range function to specify ports (here it will scans all ports between 1 and 1024)

# We also put in some error handling for catching errors

try:
    for port in range(1,1025):  
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = sock.connect_ex((remoteServerIP, port))
        if result == 0:
            print("Port {}: 	 Open".format(port))
        sock.close()

except KeyboardInterrupt:
    print("You pressed Ctrl+C")
    sys.exit()

except socket.gaierror:
    print('Hostname could not be resolved. Exiting')
    sys.exit()

except socket.error:
    print("Couldn't connect to server")
    sys.exit()

# Checking the time again
t2 = datetime.now()

# Calculates the difference of time, to see how long it took to run the script
total =  t2 - t1


##############################################
#                NEURAL NETWORK 
##############################################

#   A Very Simple Neural Network in Python 3 with Numpy, Part 2
#   Alan Richmond @ Python3.codes
import numpy as np
import matplotlib.pyplot as plt
import math, time
 
epochs = 3000
batchSize = 4
#activation = 'sigmoid'
activation = 'tanh'
#activation = 'ReLU'
 
def f(x): return np.sin(x)
 
minx, maxx = 0, 6.28
miny, maxy = -1, 1
numx = int(maxx * 5 + 1)
inputLayerSize, hiddenLayerSize, outputLayerSize = 2, 5, 1
 
funcs = {'sigmoid':  (lambda x: 1/(1 + np.exp(-x)),
                      lambda x: x * (1 - x),  (0,  1), .45),
            'tanh':  (lambda x: np.tanh(x),
                      lambda x: 1 - x**2,     (0, -1), 0.005),
            'ReLU':  (lambda x: x * (x > 0),
                      lambda x: x > 0,        (0, maxx), 0.0005),
        }
(activate, activatePrime, (mina, maxa), L) = funcs[activation]
 
X = x = np.linspace(minx, maxx, num=numx)
X.shape = (numx, 1)
Y = y = f(X)
Y = (Y - miny)*(maxa - mina)/(maxy - miny) + mina   # normalise into activation
 
# add a bias unit to the input layer
X = np.concatenate((np.atleast_2d(np.ones(X.shape[0])).T, X), axis=1)
 
# Random initial weights
r0 = math.sqrt(2.0/(inputLayerSize))
r1 = math.sqrt(2.0/(hiddenLayerSize))
Wh = np.random.uniform(size=(inputLayerSize, hiddenLayerSize),low=-r0,high=r0)
Wz = np.random.uniform(size=(hiddenLayerSize,outputLayerSize),low=-r1,high=r1)
 
def next_batch(X, Y):
    for i in np.arange(0, X.shape[0], batchSize):
        yield (X[i:i + batchSize], Y[i:i + batchSize])
 
start = time.time()
lossHistory = []
 
for i in range(epochs):         # Training:
    epochLoss = []
 
    for (Xb, Yb) in next_batch(X, Y):
 
        H = activate(np.dot(Xb, Wh))            # hidden layer results
        Z = activate(np.dot(H,  Wz))            # output layer results
        E = Yb - Z                              # how much we missed (error)
        epochLoss.append(np.sum(E**2))
 
        dZ = E * activatePrime(Z)               # delta Z
        dH = dZ.dot(Wz.T) * activatePrime(H)    # delta H
        Wz += H.T.dot(dZ) * L                   # update output layer weights
        Wh += Xb.T.dot(dH) * L                  # update hidden layer weights
 
    mse = np.average(epochLoss)
    lossHistory.append(mse)
 
X[:, 1] += maxx/(numx-1)/2
H = activate(np.dot(X, Wh))
Z = activate(np.dot(H, Wz))
Z = ((miny - maxy) * Z - maxa * miny + maxy * mina)/(mina - maxa)
Y = y

plt.figure(figsize=(12, 9))
plt.subplot(311)
plt.plot(lossHistory)
plt.subplot(312)
plt.plot(H, '-*')
plt.subplot(313)
plt.plot(x, Y, 'ro')    # training data
plt.plot(X[:, 1], Z, 'bo')   # learned
plt.show()



##############################################
#                CSV 
##############################################



import csv
import math

# write stocks data as comma-separated values
with open('stocks.csv', 'w') as f:
  writer = csv.writer(f)
  writer.writerows([
      ('GOOG', 'Google, Inc.', 505.24, 0.47, 0.09),
      ('YHOO', 'Yahoo! Inc.', 27.38, 0.33, 1.22),
      ('CNET', 'CNET Networks, Inc.', 8.62, -0.13, -1.49)
  ])

# read stocks data, print status messages
with open('stocks.csv', 'r') as f:
  stocks = csv.reader(f)
  status_labels = {-1: 'down', 0: 'unchanged', 1: 'up'}
  for ticker, name, price, change, pct in stocks:
      status = status_labels[math.floor(float(change))]
      print('%s is %s (%s%%)' % (name, status, pct))


##############################################
#                MULTI-PENDULUM HARMONIC GRAPH 
##############################################


""" Multi-pendulum Harmonograph simulator using numpy and matplotlib
 
    You can specify any number of pendulums npend > 0; this number also sets
    the number of frequencies available. The sine wave parameters are 
    a: amplitude, a random float in the range 0 to 1;
    f: frequency, a random near-integer in the range 1 to npend
    p: phase, a random float in the range 0 to 2pi
 
    Copyright 2017 Alan Richmond @ Python3.codes
    The MIT License https://opensource.org/licenses/MIT
"""
import random as r
import matplotlib.pyplot as plt
from numpy import arange, sin, cos, exp, pi
plt.rcParams["figure.figsize"] = 8,6    # size of plot in inches
 
mf = npend = 4          # # of pendulums & maximum frequency
sigma = 0.005           # frequency spread (from integer)
step = 0.01             # step size
steps = 10000           # # of steps
linew = 5               # line width
def xprint(name, value):    # convenience function to print params.
    print(name+' '.join(['%.4f' % x for x in value]))
 
t = arange(steps)*step      # time axis
d = 1 - arange(steps)/steps # decay vector

n = 1 # Number of pendulums (%d)(0=exit): "%npend)
if n != '': npend = int(n)
n = 1 # Deviation from integer freq.(%f): "%sigma)
if n != '': sigma = float(n)
ax = [r.uniform(0, 1) for i in range(npend)]
ay = [r.uniform(0, 1) for i in range(npend)]
px = [r.uniform(0, 2*pi) for i in range(npend)]
py = [r.uniform(0, 2*pi) for i in range(npend)]
fx = [r.randint(1, mf) + r.gauss(0, sigma) for i in range(npend)]
fy = [r.randint(1, mf) + r.gauss(0, sigma) for i in range(npend)]
xprint('ax = ', ax); xprint('fx = ', fx); xprint('px = ', px)
xprint('ay = ', ay); xprint('fy = ', fy); xprint('py = ', py)
x = y = 0
for i in range(npend):
    x += d * (ax[i] * sin(t * fx[i] + px[i]))
    y += d * (ay[i] * sin(t * fy[i] + py[i]))
plt.figure(facecolor = 'white')
plt.plot(x, y, 'k', linewidth=1.5)
plt.axis('off')
plt.subplots_adjust(left=0.0, right=1.0, top=1.0, bottom=0.0)
plt.show(block=True)

################################################
#   various types
################################################

import math # doesn't show up (good, we dont want modules to show)
a = 1
b = 1.1
c = float('nan')
d = float('infinity')
e = float('-infinity')
f = 'é' #doesnt render properly :(
g = {}
h = []
i = [[[]]]
j = lambda x: x+1 # doesnt show up???
def k(x):
	return x+1
class l():
	def __init__(self,x):
		self.x = x
m = l(5)
n = False
with open("C:\\dev\\t.html") as f:
  o = f

################################################
#   REGEX
################################################

import re

print(dir(re))

pattern = re.compile("(d)(?P<yo>o)f(g)")

search = pattern.search("ffdofg")
match = pattern.match("dofg")
findAll = pattern.findall("dofg dofg")
sub = pattern.sub('g','dofgoo')
split = pattern.split("h dofg g")
noMatch = pattern.search('a')

groups = search.groupdict()
span = search.span()


################################################
#   TURTLE
################################################

import turtle 
import random

painter = turtle.Turtle()

painter.speed(0)

def circleThingy(num,dis):
  for i in range(num):
      painter.forward(dis)
      painter.left(dis+50)
    
painter.pencolor("red")
circleThingy(20,50)
painter.pencolor("blue")
circleThingy(20,500)   
  
  
turtle.done()



################################################
#   unsupported code (causes jsonpickle to fail)
################################################

import matplotlib.pyplot as plt

# Create new Figure and an Axes which fills it.
fig = plt.figure(figsize=(1,1))
ax = fig.add_axes([0,0,0,1])

# above can be fixed by adding numpy support to jsonpickle
# but still need to check how jsonpickle encodes w/ numpy vs. without