const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// 全局信号对象
window.__signals__ = {
  objectCount: 0,
  isMoving: false,
  direction: 'none',
  positions: [],
  totalDistance: 0
};

let objects = [];
let cursors;
const SPEED = 360;
const OBJECT_COUNT = 10;

function preload() {
  // 使用Graphics创建蓝色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0066ff, 1);
  graphics.fillRect(0, 0, 32, 32);
  graphics.generateTexture('blueBox', 32, 32);
  graphics.destroy();
}

function create() {
  // 创建10个蓝色对象，排列成两行
  for (let i = 0; i < OBJECT_COUNT; i++) {
    const row = Math.floor(i / 5);
    const col = i % 5;
    const x = 200 + col * 100;
    const y = 200 + row * 150;
    
    const obj = this.physics.add.sprite(x, y, 'blueBox');
    obj.setCollideWorldBounds(true);
    obj.id = i;
    objects.push(obj);
  }
  
  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  
  // 初始化signals
  window.__signals__.objectCount = OBJECT_COUNT;
  updateSignals();
  
  // 添加文本提示
  this.add.text(10, 10, 'Use Arrow Keys to move all objects', {
    fontSize: '18px',
    fill: '#ffffff'
  });
  
  this.add.text(10, 35, 'Speed: 360 pixels/second', {
    fontSize: '14px',
    fill: '#cccccc'
  });
  
  console.log('Game initialized:', JSON.stringify(window.__signals__, null, 2));
}

function update(time, delta) {
  let velocityX = 0;
  let velocityY = 0;
  let direction = 'none';
  let isMoving = false;
  
  // 检测方向键输入
  if (cursors.left.isDown) {
    velocityX = -SPEED;
    direction = 'left';
    isMoving = true;
  } else if (cursors.right.isDown) {
    velocityX = SPEED;
    direction = 'right';
    isMoving = true;
  }
  
  if (cursors.up.isDown) {
    velocityY = -SPEED;
    direction = direction === 'none' ? 'up' : direction + '-up';
    isMoving = true;
  } else if (cursors.down.isDown) {
    velocityY = SPEED;
    direction = direction === 'none' ? 'down' : direction + '-down';
    isMoving = true;
  }
  
  // 同步设置所有对象的速度
  objects.forEach(obj => {
    obj.setVelocity(velocityX, velocityY);
  });
  
  // 更新signals
  window.__signals__.isMoving = isMoving;
  window.__signals__.direction = direction;
  
  if (isMoving) {
    // 计算移动距离（像素/秒 * 秒）
    const distance = SPEED * (delta / 1000);
    window.__signals__.totalDistance += distance;
  }
  
  updateSignals();
}

function updateSignals() {
  // 更新所有对象的位置信息
  window.__signals__.positions = objects.map(obj => ({
    id: obj.id,
    x: Math.round(obj.x),
    y: Math.round(obj.y)
  }));
  
  // 每秒输出一次日志
  if (!window.__lastLogTime || Date.now() - window.__lastLogTime > 1000) {
    window.__lastLogTime = Date.now();
    console.log('Status:', JSON.stringify({
      isMoving: window.__signals__.isMoving,
      direction: window.__signals__.direction,
      totalDistance: Math.round(window.__signals__.totalDistance),
      samplePosition: window.__signals__.positions[0]
    }, null, 2));
  }
}

new Phaser.Game(config);