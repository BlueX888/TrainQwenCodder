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

// 状态信号变量
let totalDistance = 0;
let objects = [];
let cursors;
const SPEED = 300;

function preload() {
  // 创建紫色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9966ff, 1);
  graphics.fillCircle(20, 20, 20);
  graphics.generateTexture('purpleCircle', 40, 40);
  graphics.destroy();
}

function create() {
  // 创建3个紫色对象，分别位于不同位置
  const positions = [
    { x: 200, y: 300 },
    { x: 400, y: 300 },
    { x: 600, y: 300 }
  ];

  objects = [];
  positions.forEach(pos => {
    const obj = this.add.sprite(pos.x, pos.y, 'purpleCircle');
    objects.push(obj);
  });

  // 创建方向键控制
  cursors = this.input.keyboard.createCursorKeys();

  // 显示状态信息
  this.statusText = this.add.text(10, 10, 'Total Distance: 0', {
    fontSize: '20px',
    fill: '#ffffff'
  });

  // 显示控制提示
  this.add.text(10, 40, 'Use Arrow Keys to move all objects', {
    fontSize: '16px',
    fill: '#aaaaaa'
  });
}

function update(time, delta) {
  let velocityX = 0;
  let velocityY = 0;

  // 检测方向键输入
  if (cursors.left.isDown) {
    velocityX = -SPEED;
  } else if (cursors.right.isDown) {
    velocityX = SPEED;
  }

  if (cursors.up.isDown) {
    velocityY = -SPEED;
  } else if (cursors.down.isDown) {
    velocityY = SPEED;
  }

  // 同步移动所有对象
  if (velocityX !== 0 || velocityY !== 0) {
    const deltaSeconds = delta / 1000;
    const moveDistance = Math.sqrt(velocityX * velocityX + velocityY * velocityY) * deltaSeconds;
    totalDistance += moveDistance;

    objects.forEach(obj => {
      obj.x += velocityX * deltaSeconds;
      obj.y += velocityY * deltaSeconds;

      // 边界检测，防止对象移出屏幕
      obj.x = Phaser.Math.Clamp(obj.x, 20, 780);
      obj.y = Phaser.Math.Clamp(obj.y, 20, 580);
    });

    // 更新状态显示
    this.statusText.setText(`Total Distance: ${Math.floor(totalDistance)}`);
  }
}

new Phaser.Game(config);