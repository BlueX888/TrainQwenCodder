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
let activeCount = 0;
let recycledCount = 0;
let respawnCount = 0;

// 对象池
let objectPool;

// 显示文本
let statusText;

function preload() {
  // 使用 Graphics 创建蓝色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x4a90e2, 1);
  graphics.fillRect(0, 0, 32, 32);
  graphics.generateTexture('blueBox', 32, 32);
  graphics.destroy();
}

function create() {
  // 创建对象池（使用 Physics Group）
  objectPool = this.physics.add.group({
    defaultKey: 'blueBox',
    maxSize: 20,
    createCallback: function(sprite) {
      // 设置物理属性
      sprite.setCollideWorldBounds(false);
      sprite.body.onWorldBounds = false;
    }
  });

  // 初始化 20 个对象
  for (let i = 0; i < 20; i++) {
    const obj = objectPool.create(
      Phaser.Math.Between(50, 750),
      Phaser.Math.Between(50, 550),
      'blueBox'
    );
    
    // 设置随机速度
    const velocityX = Phaser.Math.Between(-150, 150);
    const velocityY = Phaser.Math.Between(-150, 150);
    obj.setVelocity(velocityX, velocityY);
    
    // 添加自定义数据
    obj.setData('id', i);
  }

  // 创建状态显示文本
  statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 定时重新激活对象（每 2 秒）
  this.time.addEvent({
    delay: 2000,
    callback: respawnObject,
    callbackScope: this,
    loop: true
  });

  updateStatusText();
}

function update(time, delta) {
  activeCount = 0;

  // 遍历对象池中的所有对象
  objectPool.children.iterate(function(obj) {
    if (obj.active) {
      activeCount++;

      // 检测是否离开屏幕
      if (obj.x < -50 || obj.x > 850 || obj.y < -50 || obj.y > 650) {
        // 回收对象
        recycleObject(obj);
      }
    }
  });

  updateStatusText();
}

// 回收对象到池中
function recycleObject(obj) {
  obj.setActive(false);
  obj.setVisible(false);
  obj.body.stop();
  recycledCount++;
}

// 从池中重新激活对象
function respawnObject() {
  // 获取第一个非活动对象
  const obj = objectPool.getFirstDead(false);
  
  if (obj) {
    // 重新激活对象
    obj.setActive(true);
    obj.setVisible(true);
    
    // 重置位置到屏幕中心附近
    obj.setPosition(
      Phaser.Math.Between(200, 600),
      Phaser.Math.Between(150, 450)
    );
    
    // 设置新的随机速度
    const velocityX = Phaser.Math.Between(-150, 150);
    const velocityY = Phaser.Math.Between(-150, 150);
    obj.setVelocity(velocityX, velocityY);
    
    respawnCount++;
  }
}

// 更新状态文本
function updateStatusText() {
  const totalObjects = objectPool.getLength();
  const deadObjects = objectPool.countDead(false);
  
  statusText.setText([
    `对象池状态:`,
    `总对象数: ${totalObjects}`,
    `活动对象: ${activeCount}`,
    `池中对象: ${deadObjects}`,
    `已回收次数: ${recycledCount}`,
    `已重生次数: ${respawnCount}`,
    '',
    '提示: 蓝色方块离屏后自动回收',
    '每 2 秒从池中重新激活一个对象'
  ]);
}

// 启动游戏
new Phaser.Game(config);