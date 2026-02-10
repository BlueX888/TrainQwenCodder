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

// 状态信号变量
let poolGroup;
let statusText;
let activeCount = 0;
let totalSpawned = 0;
let recycledCount = 0;
let spawnTimer;

function preload() {
  // 使用Graphics创建青色圆形纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillCircle(16, 16, 16);
  graphics.generateTexture('cyanBall', 32, 32);
  graphics.destroy();
}

function create() {
  // 创建物理对象池，最大15个对象
  poolGroup = this.physics.add.group({
    defaultKey: 'cyanBall',
    maxSize: 15,
    runChildUpdate: false,
    createCallback: function(sprite) {
      // 对象创建时的回调
      sprite.setActive(false);
      sprite.setVisible(false);
    }
  });

  // 预创建15个对象到池中
  for (let i = 0; i < 15; i++) {
    const obj = poolGroup.create(0, 0, 'cyanBall');
    obj.setActive(false);
    obj.setVisible(false);
  }

  // 创建状态显示文本
  statusText = this.add.text(10, 10, '', {
    fontSize: '18px',
    fill: '#00ffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 定时发射对象（每500ms发射一个）
  spawnTimer = this.time.addEvent({
    delay: 500,
    callback: spawnObject,
    callbackScope: this,
    loop: true
  });

  // 添加说明文本
  this.add.text(10, 550, '对象池演示：青色球从左侧发射，离屏后自动回收重用', {
    fontSize: '16px',
    fill: '#ffffff'
  });

  updateStatusText();
}

function spawnObject() {
  // 从对象池获取一个不活跃的对象
  const obj = poolGroup.get();
  
  if (obj) {
    // 设置对象位置（从屏幕左侧随机高度发射）
    const randomY = Phaser.Math.Between(50, 550);
    obj.setPosition(0, randomY);
    
    // 激活并显示对象
    obj.setActive(true);
    obj.setVisible(true);
    
    // 设置随机速度（向右移动，带有轻微的垂直偏移）
    const velocityX = Phaser.Math.Between(100, 200);
    const velocityY = Phaser.Math.Between(-50, 50);
    obj.setVelocity(velocityX, velocityY);
    
    // 更新统计
    totalSpawned++;
    updateStatusText();
  }
}

function update(time, delta) {
  // 获取所有活跃对象
  const activeObjects = poolGroup.getChildren().filter(obj => obj.active);
  activeCount = activeObjects.length;
  
  // 检查每个活跃对象是否离开屏幕
  activeObjects.forEach(obj => {
    // 检测是否离开屏幕边界（右侧、上方或下方）
    if (obj.x > 850 || obj.y < -50 || obj.y > 650) {
      // 回收对象到池中
      recycleObject(obj);
    }
  });
  
  updateStatusText();
}

function recycleObject(obj) {
  // 停止对象移动
  obj.setVelocity(0, 0);
  
  // 隐藏并停用对象
  obj.setActive(false);
  obj.setVisible(false);
  
  // 更新回收计数
  recycledCount++;
}

function updateStatusText() {
  statusText.setText([
    `对象池状态 (最大: 15)`,
    `活跃对象: ${activeCount}`,
    `总发射数: ${totalSpawned}`,
    `回收次数: ${recycledCount}`,
    `可用对象: ${15 - activeCount}`
  ]);
}

// 启动游戏
new Phaser.Game(config);