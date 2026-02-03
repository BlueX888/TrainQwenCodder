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

// 状态变量
let objectPool;
let activeCount = 0;
let recycledCount = 0;
let spawnedTotal = 0;
let statusText;
let spawnTimer = 0;
const SPAWN_INTERVAL = 1000; // 每秒生成一个新对象

function preload() {
  // 创建青色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillCircle(16, 16, 16);
  graphics.generateTexture('cyanCircle', 32, 32);
  graphics.destroy();
}

function create() {
  // 创建对象池 - 使用 Physics Group
  objectPool = this.physics.add.group({
    defaultKey: 'cyanCircle',
    maxSize: 15,
    runChildUpdate: false,
    createCallback: function(obj) {
      // 对象创建时的回调
      obj.setActive(false);
      obj.setVisible(false);
    }
  });

  // 初始化一些对象
  for (let i = 0; i < 5; i++) {
    spawnObject.call(this);
  }

  // 创建状态显示文本
  statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 添加说明文本
  this.add.text(10, 560, '对象从左侧生成，向右移动，离屏后自动回收重用', {
    fontSize: '14px',
    fill: '#00ffff'
  });

  updateStatusText();
}

function update(time, delta) {
  // 定时生成新对象
  spawnTimer += delta;
  if (spawnTimer >= SPAWN_INTERVAL) {
    spawnTimer = 0;
    spawnObject.call(this);
  }

  // 检查所有活跃对象是否离开屏幕
  const children = objectPool.getChildren();
  children.forEach(obj => {
    if (obj.active) {
      // 检查是否离开屏幕右侧
      if (obj.x > 850) {
        recycleObject(obj);
      }
    }
  });

  updateStatusText();
}

// 从对象池中获取或创建新对象
function spawnObject() {
  // 尝试从对象池获取不活跃的对象
  let obj = objectPool.get();
  
  if (obj) {
    // 成功获取对象（可能是新创建的或回收的）
    const startY = Phaser.Math.Between(50, 550);
    const speed = Phaser.Math.Between(100, 300);
    
    obj.setPosition(-32, startY);
    obj.setVelocityX(speed);
    obj.setActive(true);
    obj.setVisible(true);
    obj.setAlpha(1);
    
    spawnedTotal++;
    activeCount++;
  } else {
    // 对象池已满（所有 15 个对象都在使用中）
    console.log('对象池已满，等待对象回收');
  }
}

// 回收对象到对象池
function recycleObject(obj) {
  obj.setActive(false);
  obj.setVisible(false);
  obj.setVelocity(0, 0);
  
  activeCount--;
  recycledCount++;
}

// 更新状态文本
function updateStatusText() {
  const poolSize = objectPool.getLength();
  const usedCount = objectPool.countActive(true);
  const availableCount = objectPool.countActive(false);
  
  statusText.setText([
    `对象池容量: 15`,
    `对象池当前大小: ${poolSize}`,
    `活跃对象: ${usedCount}`,
    `可用对象: ${availableCount}`,
    `已生成总数: ${spawnedTotal}`,
    `已回收次数: ${recycledCount}`
  ]);
}

new Phaser.Game(config);