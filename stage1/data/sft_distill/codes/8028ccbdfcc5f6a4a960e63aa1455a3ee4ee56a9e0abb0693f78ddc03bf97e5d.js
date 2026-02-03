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
const SPEED = 80;
const OBJECT_COUNT = 10;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建粉色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillCircle(16, 16, 16); // 半径16的圆形
  graphics.generateTexture('pinkCircle', 32, 32);
  graphics.destroy();

  // 创建10个粉色对象
  objects = [];
  for (let i = 0; i < OBJECT_COUNT; i++) {
    // 随机位置，确保对象完全在画布内
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    
    const obj = this.add.sprite(x, y, 'pinkCircle');
    objects.push(obj);
  }

  // 创建方向键控制
  cursors = this.input.keyboard.createCursorKeys();

  // 显示状态信息
  this.statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  updateStatusText.call(this);
}

function update(time, delta) {
  let moved = false;
  let dx = 0;
  let dy = 0;

  // 检测方向键输入
  if (cursors.left.isDown) {
    dx = -SPEED * (delta / 1000);
    moved = true;
  } else if (cursors.right.isDown) {
    dx = SPEED * (delta / 1000);
    moved = true;
  }

  if (cursors.up.isDown) {
    dy = -SPEED * (delta / 1000);
    moved = true;
  } else if (cursors.down.isDown) {
    dy = SPEED * (delta / 1000);
    moved = true;
  }

  // 同步移动所有对象
  if (moved) {
    const distance = Math.sqrt(dx * dx + dy * dy);
    totalDistance += distance;

    objects.forEach(obj => {
      obj.x += dx;
      obj.y += dy;

      // 边界限制（可选）
      obj.x = Phaser.Math.Clamp(obj.x, 16, 784);
      obj.y = Phaser.Math.Clamp(obj.y, 16, 584);
    });

    updateStatusText.call(this);
  }
}

function updateStatusText() {
  this.statusText.setText(
    `Objects: ${OBJECT_COUNT} | Speed: ${SPEED} | Total Distance: ${Math.floor(totalDistance)}`
  );
}

new Phaser.Game(config);