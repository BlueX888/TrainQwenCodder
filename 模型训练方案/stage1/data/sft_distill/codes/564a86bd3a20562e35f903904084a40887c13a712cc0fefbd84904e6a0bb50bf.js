const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

// 全局信号对象
window.__signals__ = {
  objectCount: 10,
  speed: 300,
  positions: [],
  isMoving: false,
  direction: { x: 0, y: 0 }
};

let objects = [];
let cursors;
const SPEED = 300;
const OBJECT_COUNT = 10;

function preload() {
  // 创建青色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillCircle(20, 20, 20); // 半径20的圆形
  graphics.generateTexture('cyanCircle', 40, 40);
  graphics.destroy();
}

function create() {
  // 创建10个青色对象
  for (let i = 0; i < OBJECT_COUNT; i++) {
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    const obj = this.add.sprite(x, y, 'cyanCircle');
    obj.setOrigin(0.5, 0.5);
    objects.push(obj);
  }

  // 创建方向键控制
  cursors = this.input.keyboard.createCursorKeys();

  // 添加提示文本
  const text = this.add.text(10, 10, 'Use Arrow Keys to move all objects', {
    fontSize: '18px',
    color: '#ffffff'
  });

  // 初始化信号位置数据
  updateSignals();

  console.log('Game initialized with 10 cyan objects');
  console.log(JSON.stringify(window.__signals__, null, 2));
}

function update(time, delta) {
  let velocityX = 0;
  let velocityY = 0;
  let moving = false;

  // 检测方向键输入
  if (cursors.left.isDown) {
    velocityX = -SPEED;
    moving = true;
  } else if (cursors.right.isDown) {
    velocityX = SPEED;
    moving = true;
  }

  if (cursors.up.isDown) {
    velocityY = -SPEED;
    moving = true;
  } else if (cursors.down.isDown) {
    velocityY = SPEED;
    moving = true;
  }

  // 同步移动所有对象
  const deltaSeconds = delta / 1000;
  objects.forEach(obj => {
    obj.x += velocityX * deltaSeconds;
    obj.y += velocityY * deltaSeconds;

    // 边界限制
    obj.x = Phaser.Math.Clamp(obj.x, 20, 780);
    obj.y = Phaser.Math.Clamp(obj.y, 20, 580);
  });

  // 更新信号
  window.__signals__.isMoving = moving;
  window.__signals__.direction = {
    x: velocityX,
    y: velocityY
  };

  // 每60帧更新一次位置信号（约1秒）
  if (time % 1000 < delta) {
    updateSignals();
    console.log(JSON.stringify({
      timestamp: time,
      moving: moving,
      direction: window.__signals__.direction,
      samplePosition: window.__signals__.positions[0]
    }));
  }
}

function updateSignals() {
  window.__signals__.positions = objects.map((obj, index) => ({
    id: index,
    x: Math.round(obj.x),
    y: Math.round(obj.y)
  }));
}

new Phaser.Game(config);