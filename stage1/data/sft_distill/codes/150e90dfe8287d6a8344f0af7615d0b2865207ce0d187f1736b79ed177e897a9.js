const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let objects = [];
let cursors;
const SPEED = 300;
const OBJECT_COUNT = 10;

// 初始化全局信号对象
window.__signals__ = {
  objectCount: OBJECT_COUNT,
  positions: [],
  velocity: { x: 0, y: 0 },
  moveCount: 0,
  timestamp: Date.now()
};

function preload() {
  // 使用Graphics创建青色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillCircle(20, 20, 20); // 半径20的圆形
  graphics.generateTexture('cyanCircle', 40, 40);
  graphics.destroy();
}

function create() {
  // 创建10个青色对象
  for (let i = 0; i < OBJECT_COUNT; i++) {
    // 随机位置分布
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    
    const obj = this.add.image(x, y, 'cyanCircle');
    obj.setData('id', i);
    objects.push(obj);
  }

  // 创建方向键控制
  cursors = this.input.keyboard.createCursorKeys();

  // 添加文字提示
  this.add.text(10, 10, 'Use Arrow Keys to Move All Objects', {
    fontSize: '16px',
    fill: '#ffffff'
  });

  // 添加状态显示
  this.statusText = this.add.text(10, 35, '', {
    fontSize: '14px',
    fill: '#00ffff'
  });

  // 初始化信号
  updateSignals();
  
  console.log('Game initialized:', JSON.stringify(window.__signals__, null, 2));
}

function update(time, delta) {
  let velocityX = 0;
  let velocityY = 0;
  let isMoving = false;

  // 检测方向键输入
  if (cursors.left.isDown) {
    velocityX = -SPEED;
    isMoving = true;
  } else if (cursors.right.isDown) {
    velocityX = SPEED;
    isMoving = true;
  }

  if (cursors.up.isDown) {
    velocityY = -SPEED;
    isMoving = true;
  } else if (cursors.down.isDown) {
    velocityY = SPEED;
    isMoving = true;
  }

  // 同步移动所有对象
  if (isMoving) {
    const deltaSeconds = delta / 1000;
    const moveX = velocityX * deltaSeconds;
    const moveY = velocityY * deltaSeconds;

    objects.forEach(obj => {
      // 移动对象
      obj.x += moveX;
      obj.y += moveY;

      // 边界检测（可选：限制在画布内）
      obj.x = Phaser.Math.Clamp(obj.x, 20, 780);
      obj.y = Phaser.Math.Clamp(obj.y, 20, 580);
    });

    // 更新移动计数
    window.__signals__.moveCount++;
  }

  // 更新速度信号
  window.__signals__.velocity.x = velocityX;
  window.__signals__.velocity.y = velocityY;

  // 每30帧更新一次位置信号和日志
  if (time % 500 < delta) {
    updateSignals();
    
    // 更新状态文字
    this.statusText.setText(
      `Moving: ${isMoving} | Velocity: (${velocityX}, ${velocityY}) | Moves: ${window.__signals__.moveCount}`
    );

    // 输出日志
    if (isMoving) {
      console.log('Movement update:', JSON.stringify({
        velocity: window.__signals__.velocity,
        moveCount: window.__signals__.moveCount,
        samplePosition: window.__signals__.positions[0]
      }));
    }
  }
}

function updateSignals() {
  // 更新所有对象的位置信息
  window.__signals__.positions = objects.map(obj => ({
    id: obj.getData('id'),
    x: Math.round(obj.x),
    y: Math.round(obj.y)
  }));
  
  window.__signals__.timestamp = Date.now();
}

new Phaser.Game(config);