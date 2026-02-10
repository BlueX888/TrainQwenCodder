// 完整的 Phaser3 代码
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

// 全局状态变量
let objects = [];
let cursors;
let moveFrameCount = 0; // 记录移动帧数作为验证信号
let statusText;

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 生成灰色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillRect(0, 0, 40, 40);
  graphics.generateTexture('grayBox', 40, 40);
  graphics.destroy();

  // 创建5个灰色对象，分散在不同位置
  const positions = [
    { x: 200, y: 300 },
    { x: 400, y: 200 },
    { x: 600, y: 300 },
    { x: 300, y: 400 },
    { x: 500, y: 400 }
  ];

  positions.forEach(pos => {
    const obj = this.physics.add.sprite(pos.x, pos.y, 'grayBox');
    obj.setCollideWorldBounds(true); // 限制在世界边界内
    objects.push(obj);
  });

  // 创建方向键输入
  cursors = this.input.keyboard.createCursorKeys();

  // 添加状态文本显示
  statusText = this.add.text(10, 10, 'Move Frames: 0', {
    fontSize: '20px',
    fill: '#ffffff'
  });

  // 添加提示文本
  this.add.text(10, 40, 'Use Arrow Keys to Move All Objects', {
    fontSize: '16px',
    fill: '#00ff00'
  });
}

function update(time, delta) {
  let velocityX = 0;
  let velocityY = 0;
  let isMoving = false;

  // 检测方向键输入
  if (cursors.left.isDown) {
    velocityX = -160;
    isMoving = true;
  } else if (cursors.right.isDown) {
    velocityX = 160;
    isMoving = true;
  }

  if (cursors.up.isDown) {
    velocityY = -160;
    isMoving = true;
  } else if (cursors.down.isDown) {
    velocityY = 160;
    isMoving = true;
  }

  // 同步设置所有对象的速度
  objects.forEach(obj => {
    obj.setVelocity(velocityX, velocityY);
  });

  // 更新移动帧计数
  if (isMoving) {
    moveFrameCount++;
    statusText.setText(`Move Frames: ${moveFrameCount}`);
  }
}

// 启动游戏
new Phaser.Game(config);