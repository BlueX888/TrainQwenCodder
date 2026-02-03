const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
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

let objects = [];
let cursors;
let moveCount = 0;
let activeObjects = 20;
let statusText;

const SPEED = 80;
const OBJECT_COUNT = 20;

function preload() {
  // 程序化生成粉色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillCircle(16, 16, 16);
  graphics.generateTexture('pinkCircle', 32, 32);
  graphics.destroy();
}

function create() {
  // 创建20个粉色对象
  for (let i = 0; i < OBJECT_COUNT; i++) {
    // 随机位置，避免边界
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    
    const obj = this.physics.add.sprite(x, y, 'pinkCircle');
    obj.setCollideWorldBounds(true);
    obj.setBounce(0);
    objects.push(obj);
  }

  // 创建方向键控制
  cursors = this.input.keyboard.createCursorKeys();

  // 显示状态信息
  statusText = this.add.text(10, 10, '', {
    fontSize: '18px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  updateStatusText();

  // 添加提示文本
  this.add.text(400, 580, '使用方向键控制所有粉色对象移动', {
    fontSize: '16px',
    fill: '#ffffff'
  }).setOrigin(0.5);
}

function update() {
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

  // 同步更新所有对象的速度
  objects.forEach(obj => {
    obj.setVelocity(velocityX, velocityY);
  });

  // 如果有移动，增加移动计数
  if (isMoving && (velocityX !== 0 || velocityY !== 0)) {
    // 每60帧增加一次计数（约1秒）
    if (this.game.getFrame() % 60 === 0) {
      moveCount++;
      updateStatusText();
    }
  }
}

function updateStatusText() {
  statusText.setText([
    `活跃对象: ${activeObjects}/${OBJECT_COUNT}`,
    `移动次数: ${moveCount}`,
    `速度: ${SPEED} px/s`
  ]);
}

new Phaser.Game(config);