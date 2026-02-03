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
let bulletsFired = 0;
let activeBullets = 0;
let bulletsGroup;
let infoText;

function preload() {
  // 创建橙色子弹纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff8800, 1); // 橙色
  graphics.fillCircle(8, 8, 8); // 圆形子弹，半径8
  graphics.generateTexture('bullet', 16, 16);
  graphics.destroy();
}

function create() {
  // 创建子弹对象池（使用物理组）
  bulletsGroup = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 50, // 对象池最大容量
    runChildUpdate: false,
    createCallback: function(bullet) {
      // 初始化子弹时的回调
      bullet.setActive(false);
      bullet.setVisible(false);
    }
  });

  // 监听鼠标右键点击事件
  this.input.on('pointerdown', (pointer) => {
    // 检查是否为右键（button === 2）
    if (pointer.rightButtonDown()) {
      fireBullet.call(this, pointer.x, pointer.y);
    }
  });

  // 显示信息文本
  infoText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 添加提示文本
  this.add.text(400, 300, '右键点击发射橙色子弹', {
    fontSize: '24px',
    fill: '#ff8800'
  }).setOrigin(0.5);

  updateInfoText();
}

function update(time, delta) {
  // 检查所有活跃的子弹
  const bullets = bulletsGroup.getChildren();
  activeBullets = 0;

  bullets.forEach((bullet) => {
    if (bullet.active) {
      activeBullets++;
      
      // 检查子弹是否离开边界
      if (bullet.x < -20 || bullet.x > 820 || 
          bullet.y < -20 || bullet.y > 620) {
        // 回收子弹到对象池
        bulletsGroup.killAndHide(bullet);
        bullet.setActive(false);
        bullet.body.stop();
      }
    }
  });

  updateInfoText();
}

function fireBullet(targetX, targetY) {
  // 从对象池获取子弹（如果池中没有可用对象，会自动创建新的）
  const bullet = bulletsGroup.get(400, 300);
  
  if (bullet) {
    // 激活子弹
    bullet.setActive(true);
    bullet.setVisible(true);
    
    // 设置子弹位置（从屏幕中心发射）
    bullet.setPosition(400, 300);
    
    // 计算发射方向
    const angle = Phaser.Math.Angle.Between(400, 300, targetX, targetY);
    
    // 设置子弹速度（速度为160）
    const velocityX = Math.cos(angle) * 160;
    const velocityY = Math.sin(angle) * 160;
    bullet.setVelocity(velocityX, velocityY);
    
    // 旋转子弹朝向目标方向
    bullet.setRotation(angle);
    
    // 增加发射计数
    bulletsFired++;
  }
}

function updateInfoText() {
  infoText.setText([
    `总发射数: ${bulletsFired}`,
    `活跃子弹: ${activeBullets}`,
    `对象池大小: ${bulletsGroup.getLength()}`,
    `提示: 右键点击发射子弹`
  ]);
}

// 启动游戏
new Phaser.Game(config);