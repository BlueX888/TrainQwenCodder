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

// 全局信号对象
window.__signals__ = {
  poolSize: 15,
  activeObjects: 0,
  totalSpawned: 0,
  totalRecycled: 0,
  availableInPool: 15
};

let objectPool;
let spawnTimer;
let infoText;

function preload() {
  // 创建粉色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillCircle(20, 20, 20);
  graphics.generateTexture('pinkCircle', 40, 40);
  graphics.destroy();
}

function create() {
  // 创建对象池，最大15个对象
  objectPool = this.physics.add.group({
    defaultKey: 'pinkCircle',
    maxSize: 15,
    createCallback: function(obj) {
      obj.setActive(false);
      obj.setVisible(false);
    }
  });

  // 显示信息文本
  infoText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 定时发射对象（每500ms）
  spawnTimer = this.time.addEvent({
    delay: 500,
    callback: spawnObject,
    callbackScope: this,
    loop: true
  });

  // 添加说明文本
  this.add.text(400, 550, '粉色圆球从左侧发射，离开屏幕后自动回收到对象池', {
    fontSize: '14px',
    fill: '#cccccc'
  }).setOrigin(0.5);

  console.log('[POOL INIT]', JSON.stringify(window.__signals__));
}

function spawnObject() {
  // 从对象池获取对象
  const obj = objectPool.get();
  
  if (obj) {
    // 重置对象位置和速度
    obj.setPosition(-40, Phaser.Math.Between(50, 550));
    obj.setVelocity(Phaser.Math.Between(150, 300), Phaser.Math.Between(-100, 100));
    obj.setActive(true);
    obj.setVisible(true);
    
    // 更新统计信息
    window.__signals__.totalSpawned++;
    updateSignals();
    
    console.log('[SPAWN]', JSON.stringify({
      totalSpawned: window.__signals__.totalSpawned,
      activeObjects: window.__signals__.activeObjects,
      position: { x: obj.x, y: obj.y }
    }));
  } else {
    console.log('[POOL FULL] 对象池已满，无法生成新对象');
  }
}

function update() {
  // 检查所有活跃对象
  const activeObjects = objectPool.getChildren().filter(obj => obj.active);
  
  activeObjects.forEach(obj => {
    // 检测是否离开屏幕边界（右侧、上侧、下侧）
    if (obj.x > 840 || obj.y < -40 || obj.y > 640) {
      // 回收对象
      obj.setActive(false);
      obj.setVisible(false);
      obj.body.reset(-100, -100); // 重置物理体位置
      obj.setVelocity(0, 0);
      
      window.__signals__.totalRecycled++;
      
      console.log('[RECYCLE]', JSON.stringify({
        totalRecycled: window.__signals__.totalRecycled,
        activeObjects: window.__signals__.activeObjects - 1,
        reason: obj.x > 840 ? 'right' : (obj.y < -40 ? 'top' : 'bottom')
      }));
    }
  });
  
  // 更新信号
  updateSignals();
  
  // 更新显示文本
  infoText.setText([
    `对象池大小: ${window.__signals__.poolSize}`,
    `活跃对象: ${window.__signals__.activeObjects}`,
    `可用对象: ${window.__signals__.availableInPool}`,
    `总发射数: ${window.__signals__.totalSpawned}`,
    `总回收数: ${window.__signals__.totalRecycled}`
  ]);
}

function updateSignals() {
  const activeCount = objectPool.getChildren().filter(obj => obj.active).length;
  window.__signals__.activeObjects = activeCount;
  window.__signals__.availableInPool = window.__signals__.poolSize - activeCount;
}

new Phaser.Game(config);