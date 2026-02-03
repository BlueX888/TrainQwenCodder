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
let bulletsFired = 0;
let bulletsActive = 0;
let bulletGroup;
let statusText;

function preload() {
  // 使用 Graphics 创建橙色子弹纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFF8C00, 1); // 橙色
  graphics.fillCircle(8, 8, 8); // 半径8的圆形
  graphics.generateTexture('bullet', 16, 16);
  graphics.destroy();
}

function create() {
  // 创建子弹对象池（Physics Group）
  bulletGroup = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 50, // 对象池最大容量
    runChildUpdate: false,
    createCallback: function(bullet) {
      // 初始化子弹
      bullet.setActive(false);
      bullet.setVisible(false);
    }
  });

  // 监听鼠标点击事件
  this.input.on('pointerdown', function(pointer) {
    // 检测是否为右键点击
    if (pointer.rightButtonDown()) {
      fireBullet.call(this, pointer.x, pointer.y);
    }
  }, this);

  // 添加状态显示文本
  statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  updateStatusText();

  // 添加提示文本
  this.add.text(400, 300, '右键点击发射橙色子弹', {
    fontSize: '24px',
    fill: '#ffffff'
  }).setOrigin(0.5);
}

function update(time, delta) {
  // 遍历所有活跃的子弹，检查是否离开边界
  bulletGroup.getChildren().forEach(bullet => {
    if (bullet.active) {
      const bounds = this.physics.world.bounds;
      
      // 检测子弹是否离开世界边界
      if (bullet.x < bounds.x - 20 || 
          bullet.x > bounds.x + bounds.width + 20 ||
          bullet.y < bounds.y - 20 || 
          bullet.y > bounds.y + bounds.height + 20) {
        // 回收子弹到对象池
        recycleBullet(bullet);
      }
    }
  });
  
  updateStatusText();
}

function fireBullet(x, y) {
  // 从对象池获取子弹
  let bullet = bulletGroup.get(x, y);
  
  if (bullet) {
    // 激活子弹
    bullet.setActive(true);
    bullet.setVisible(true);
    
    // 计算从屏幕中心到点击位置的方向
    const centerX = 400;
    const centerY = 300;
    const angle = Phaser.Math.Angle.Between(centerX, centerY, x, y);
    
    // 设置子弹速度（速度120）
    const velocityX = Math.cos(angle) * 120;
    const velocityY = Math.sin(angle) * 120;
    
    bullet.setPosition(centerX, centerY);
    bullet.setVelocity(velocityX, velocityY);
    
    // 更新状态
    bulletsFired++;
    bulletsActive++;
  }
}

function recycleBullet(bullet) {
  // 回收子弹到对象池
  bullet.setActive(false);
  bullet.setVisible(false);
  bullet.setVelocity(0, 0);
  
  // 更新状态
  bulletsActive--;
}

function updateStatusText() {
  if (statusText) {
    statusText.setText([
      `总发射子弹数: ${bulletsFired}`,
      `当前活跃子弹: ${bulletsActive}`,
      `对象池容量: ${bulletGroup.getLength()}/${bulletGroup.maxSize}`
    ]);
  }
}

const game = new Phaser.Game(config);