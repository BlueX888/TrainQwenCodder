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
  objects: [],
  isMoving: false,
  direction: 'none',
  totalMoves: 0,
  lastUpdate: 0
};

let objects = [];
let cursors;
const SPEED = 300;
const OBJECT_RADIUS = 20;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建紫色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9b59b6, 1); // 紫色
  graphics.fillCircle(OBJECT_RADIUS, OBJECT_RADIUS, OBJECT_RADIUS);
  graphics.generateTexture('purpleCircle', OBJECT_RADIUS * 2, OBJECT_RADIUS * 2);
  graphics.destroy();

  // 创建5个紫色对象，分散排列
  const positions = [
    { x: 200, y: 200 },
    { x: 400, y: 150 },
    { x: 600, y: 250 },
    { x: 300, y: 400 },
    { x: 500, y: 450 }
  ];

  for (let i = 0; i < 5; i++) {
    const obj = this.add.image(positions[i].x, positions[i].y, 'purpleCircle');
    obj.setData('id', i);
    obj.setData('velocity', { x: 0, y: 0 });
    objects.push(obj);
  }

  // 创建方向键输入
  cursors = this.input.keyboard.createCursorKeys();

  // 添加文本提示
  const text = this.add.text(10, 10, '使用方向键同时控制5个紫色对象', {
    fontSize: '18px',
    color: '#ffffff'
  });

  // 添加状态显示文本
  this.statusText = this.add.text(10, 40, '', {
    fontSize: '14px',
    color: '#00ff00'
  });

  // 定期更新signals
  this.time.addEvent({
    delay: 100,
    callback: updateSignals,
    callbackScope: this,
    loop: true
  });

  console.log('Game created: 5 purple objects ready to be controlled');
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
    direction = direction === 'none' ? 'up' : direction + '+up';
    isMoving = true;
  } else if (cursors.down.isDown) {
    velocityY = SPEED;
    direction = direction === 'none' ? 'down' : direction + '+down';
    isMoving = true;
  }

  // 同步移动所有对象
  const deltaSeconds = delta / 1000;
  objects.forEach((obj, index) => {
    if (isMoving) {
      // 计算新位置
      let newX = obj.x + velocityX * deltaSeconds;
      let newY = obj.y + velocityY * deltaSeconds;

      // 边界检测
      newX = Phaser.Math.Clamp(newX, OBJECT_RADIUS, 800 - OBJECT_RADIUS);
      newY = Phaser.Math.Clamp(newY, OBJECT_RADIUS, 600 - OBJECT_RADIUS);

      // 更新位置
      obj.setPosition(newX, newY);
      obj.setData('velocity', { x: velocityX, y: velocityY });
    } else {
      obj.setData('velocity', { x: 0, y: 0 });
    }
  });

  // 更新全局状态
  window.__signals__.isMoving = isMoving;
  window.__signals__.direction = direction;
  window.__signals__.lastUpdate = time;
  
  if (isMoving && direction !== window.__signals__.lastDirection) {
    window.__signals__.totalMoves++;
    window.__signals__.lastDirection = direction;
  }

  // 更新状态文本
  if (this.statusText) {
    this.statusText.setText(
      `移动中: ${isMoving ? '是' : '否'} | 方向: ${direction} | 总移动次数: ${window.__signals__.totalMoves}`
    );
  }
}

function updateSignals() {
  // 更新所有对象的位置信息到signals
  window.__signals__.objects = objects.map(obj => ({
    id: obj.getData('id'),
    x: Math.round(obj.x),
    y: Math.round(obj.y),
    velocity: obj.getData('velocity')
  }));

  // 输出JSON日志（每秒一次）
  if (Date.now() % 1000 < 100) {
    console.log(JSON.stringify({
      timestamp: Date.now(),
      isMoving: window.__signals__.isMoving,
      direction: window.__signals__.direction,
      totalMoves: window.__signals__.totalMoves,
      objectCount: objects.length,
      positions: window.__signals__.objects.map(o => ({ x: o.x, y: o.y }))
    }));
  }
}

const game = new Phaser.Game(config);