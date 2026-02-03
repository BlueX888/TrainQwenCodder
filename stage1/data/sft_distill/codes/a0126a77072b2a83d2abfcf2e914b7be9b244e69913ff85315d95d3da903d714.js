const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// 全局信号对象
window.__signals__ = {
  objectCount: 0,
  containerPosition: { x: 0, y: 0 },
  velocity: { x: 0, y: 0 },
  totalDistance: 0,
  moveCount: 0,
  isMoving: false
};

let objectsContainer;
let cursors;
const SPEED = 300;
const OBJECT_COUNT = 15;
const OBJECT_RADIUS = 15;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建容器用于统一控制所有对象
  objectsContainer = this.add.container(400, 300);
  
  // 创建15个黄色圆形对象
  for (let i = 0; i < OBJECT_COUNT; i++) {
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFFFF00, 1); // 黄色
    graphics.fillCircle(0, 0, OBJECT_RADIUS);
    
    // 随机分布在容器内的相对位置
    const randomX = Phaser.Math.Between(-200, 200);
    const randomY = Phaser.Math.Between(-150, 150);
    graphics.setPosition(randomX, randomY);
    
    // 添加到容器
    objectsContainer.add(graphics);
  }
  
  // 创建方向键输入
  cursors = this.input.keyboard.createCursorKeys();
  
  // 初始化信号
  window.__signals__.objectCount = OBJECT_COUNT;
  window.__signals__.containerPosition = {
    x: objectsContainer.x,
    y: objectsContainer.y
  };
  
  // 添加提示文本
  const instructionText = this.add.text(10, 10, 
    'Use Arrow Keys to move all 15 yellow objects together', 
    { 
      fontSize: '16px', 
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }
  );
  instructionText.setDepth(100);
  
  // 添加状态显示文本
  this.statusText = this.add.text(10, 50, '', {
    fontSize: '14px',
    fill: '#00ff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  this.statusText.setDepth(100);
  
  console.log('Game initialized with signals:', JSON.stringify(window.__signals__));
}

function update(time, delta) {
  // 计算速度（像素/秒转换为像素/帧）
  const velocity = SPEED * (delta / 1000);
  
  let vx = 0;
  let vy = 0;
  let isMoving = false;
  
  // 检测方向键输入
  if (cursors.left.isDown) {
    vx = -velocity;
    isMoving = true;
  } else if (cursors.right.isDown) {
    vx = velocity;
    isMoving = true;
  }
  
  if (cursors.up.isDown) {
    vy = -velocity;
    isMoving = true;
  } else if (cursors.down.isDown) {
    vy = velocity;
    isMoving = true;
  }
  
  // 移动容器（所有对象同步移动）
  if (isMoving) {
    objectsContainer.x += vx;
    objectsContainer.y += vy;
    
    // 边界检测（保持容器中心在画布内）
    objectsContainer.x = Phaser.Math.Clamp(objectsContainer.x, 0, 800);
    objectsContainer.y = Phaser.Math.Clamp(objectsContainer.y, 0, 600);
    
    // 更新信号
    const distance = Math.sqrt(vx * vx + vy * vy);
    window.__signals__.totalDistance += distance;
    window.__signals__.moveCount++;
  }
  
  // 更新信号状态
  window.__signals__.containerPosition = {
    x: Math.round(objectsContainer.x),
    y: Math.round(objectsContainer.y)
  };
  window.__signals__.velocity = {
    x: Math.round(vx * 100) / 100,
    y: Math.round(vy * 100) / 100
  };
  window.__signals__.isMoving = isMoving;
  
  // 更新状态显示
  this.statusText.setText([
    `Position: (${window.__signals__.containerPosition.x}, ${window.__signals__.containerPosition.y})`,
    `Velocity: (${window.__signals__.velocity.x}, ${window.__signals__.velocity.y})`,
    `Total Distance: ${Math.round(window.__signals__.totalDistance)}`,
    `Move Count: ${window.__signals__.moveCount}`,
    `Status: ${isMoving ? 'MOVING' : 'IDLE'}`
  ]);
  
  // 每秒输出一次日志
  if (Math.floor(time / 1000) !== Math.floor((time - delta) / 1000)) {
    console.log('Signals Update:', JSON.stringify(window.__signals__));
  }
}

const game = new Phaser.Game(config);