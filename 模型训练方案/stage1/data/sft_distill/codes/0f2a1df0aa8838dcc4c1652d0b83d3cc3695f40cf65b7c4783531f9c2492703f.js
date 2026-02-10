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
let moveCount = 0; // 状态信号：记录移动操作次数
let statusText;

function preload() {
  // 使用 Graphics 生成粉色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillCircle(16, 16, 16); // 绘制圆形，半径16
  graphics.generateTexture('pinkCircle', 32, 32);
  graphics.destroy();
}

function create() {
  // 创建 20 个粉色对象
  for (let i = 0; i < 20; i++) {
    // 随机位置分布
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    
    const obj = this.physics.add.sprite(x, y, 'pinkCircle');
    obj.setCollideWorldBounds(true); // 限制在画布内
    obj.setBounce(0); // 无弹性
    
    objects.push(obj);
  }
  
  // 创建方向键输入
  cursors = this.input.keyboard.createCursorKeys();
  
  // 添加状态显示文本
  statusText = this.add.text(10, 10, 'Move Count: 0', {
    fontSize: '20px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  statusText.setDepth(1000);
  
  // 添加说明文本
  this.add.text(10, 570, 'Use Arrow Keys to move all objects', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
}

function update() {
  let velocityX = 0;
  let velocityY = 0;
  let isMoving = false;
  
  // 检测方向键状态
  if (cursors.left.isDown) {
    velocityX = -80;
    isMoving = true;
  } else if (cursors.right.isDown) {
    velocityX = 80;
    isMoving = true;
  }
  
  if (cursors.up.isDown) {
    velocityY = -80;
    isMoving = true;
  } else if (cursors.down.isDown) {
    velocityY = 80;
    isMoving = true;
  }
  
  // 同步设置所有对象的速度
  objects.forEach(obj => {
    obj.setVelocity(velocityX, velocityY);
  });
  
  // 更新移动次数（仅在有移动时计数）
  if (isMoving) {
    moveCount++;
    statusText.setText(`Move Count: ${moveCount}`);
  }
}

// 创建游戏实例
new Phaser.Game(config);