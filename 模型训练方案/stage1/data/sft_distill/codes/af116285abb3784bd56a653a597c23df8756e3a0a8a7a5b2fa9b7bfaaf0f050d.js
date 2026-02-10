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
  },
  backgroundColor: '#2d2d2d'
};

// 全局变量存储对象和信号
let objects = [];
let cursors;
let moveCount = 0;
let lastDirection = 'none';

// 初始化 signals
window.__signals__ = {
  objectCount: 0,
  moveCount: 0,
  currentDirection: 'none',
  objectPositions: []
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 创建灰色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillRect(0, 0, 32, 32);
  graphics.generateTexture('grayBox', 32, 32);
  graphics.destroy();

  // 创建 20 个灰色对象
  for (let i = 0; i < 20; i++) {
    // 随机位置，确保不会超出边界
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    
    const obj = this.physics.add.sprite(x, y, 'grayBox');
    obj.setCollideWorldBounds(true); // 碰撞世界边界
    obj.setBounce(0); // 无弹性
    obj.setDrag(0); // 无拖拽阻力
    
    objects.push(obj);
  }

  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 更新初始 signals
  updateSignals();

  // 添加文字提示
  this.add.text(10, 10, 'Use Arrow Keys to Move All Objects', {
    fontSize: '18px',
    color: '#ffffff'
  });

  this.add.text(10, 35, 'Speed: 160 pixels/sec', {
    fontSize: '14px',
    color: '#aaaaaa'
  });

  // 显示对象数量
  this.add.text(10, 560, 'Objects: 20', {
    fontSize: '14px',
    color: '#aaaaaa'
  });
}

function update(time, delta) {
  let velocityX = 0;
  let velocityY = 0;
  let currentDirection = 'none';

  // 检测方向键状态
  if (cursors.left.isDown) {
    velocityX = -160;
    currentDirection = 'left';
  } else if (cursors.right.isDown) {
    velocityX = 160;
    currentDirection = 'right';
  }

  if (cursors.up.isDown) {
    velocityY = -160;
    currentDirection = currentDirection === 'none' ? 'up' : currentDirection + '+up';
  } else if (cursors.down.isDown) {
    velocityY = 160;
    currentDirection = currentDirection === 'none' ? 'down' : currentDirection + '+down';
  }

  // 同步设置所有对象的速度
  objects.forEach(obj => {
    obj.setVelocity(velocityX, velocityY);
  });

  // 记录移动状态变化
  if (currentDirection !== 'none' && currentDirection !== lastDirection) {
    moveCount++;
    lastDirection = currentDirection;
    updateSignals();
    
    // 输出日志 JSON
    console.log(JSON.stringify({
      event: 'direction_change',
      direction: currentDirection,
      moveCount: moveCount,
      timestamp: time
    }));
  } else if (currentDirection === 'none' && lastDirection !== 'none') {
    lastDirection = 'none';
    updateSignals();
    
    console.log(JSON.stringify({
      event: 'stopped',
      moveCount: moveCount,
      timestamp: time
    }));
  }
}

function updateSignals() {
  window.__signals__.objectCount = objects.length;
  window.__signals__.moveCount = moveCount;
  window.__signals__.currentDirection = lastDirection;
  window.__signals__.objectPositions = objects.map((obj, index) => ({
    id: index,
    x: Math.round(obj.x),
    y: Math.round(obj.y)
  }));
}

// 启动游戏
new Phaser.Game(config);