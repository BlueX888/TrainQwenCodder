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

// 可验证的状态信号
let bulletsFired = 0;
let activeBullets = 0;

let bullets;
let infoText;

function preload() {
  // 使用 Graphics 创建橙色子弹纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFF8C00, 1); // 橙色
  graphics.fillCircle(8, 8, 8); // 半径8的圆形
  graphics.generateTexture('bullet', 16, 16);
  graphics.destroy();
}

function create() {
  // 创建子弹对象池
  bullets = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 50, // 对象池最大容量
    runChildUpdate: false
  });

  // 监听鼠标右键点击事件
  this.input.on('pointerdown', (pointer) => {
    if (pointer.rightButtonDown()) {
      fireBullet.call(this, pointer.x, pointer.y);
    }
  });

  // 显示信息文本
  infoText = this.add.text(10, 10, '', {
    fontSize: '18px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 添加提示文本
  this.add.text(400, 300, '右键点击发射橙色子弹', {
    fontSize: '24px',
    color: '#FF8C00'
  }).setOrigin(0.5);

  updateInfoText();
}

function update(time, delta) {
  // 检查并回收离开边界的子弹
  bullets.children.entries.forEach((bullet) => {
    if (bullet.active) {
      // 检查是否离开屏幕边界
      if (bullet.x < -20 || bullet.x > 820 || 
          bullet.y < -20 || bullet.y > 620) {
        // 回收子弹到对象池
        bullets.killAndHide(bullet);
        bullet.body.reset(-100, -100); // 重置位置到屏幕外
        activeBullets--;
        updateInfoText();
      }
    }
  });
}

function fireBullet(x, y) {
  // 从对象池获取子弹
  const bullet = bullets.get(x, y);
  
  if (bullet) {
    // 激活并显示子弹
    bullet.setActive(true);
    bullet.setVisible(true);
    
    // 计算发射方向（从屏幕中心向鼠标位置）
    const centerX = 400;
    const centerY = 300;
    const angle = Phaser.Math.Angle.Between(centerX, centerY, x, y);
    
    // 设置子弹速度（速度为160）
    const velocityX = Math.cos(angle) * 160;
    const velocityY = Math.sin(angle) * 160;
    
    bullet.body.setVelocity(velocityX, velocityY);
    
    // 更新状态信号
    bulletsFired++;
    activeBullets++;
    updateInfoText();
  }
}

function updateInfoText() {
  infoText.setText([
    `发射子弹总数: ${bulletsFired}`,
    `当前活跃子弹: ${activeBullets}`,
    `对象池大小: ${bullets.getLength()}`,
    `可用子弹: ${bullets.getTotalFree()}`
  ]);
}

new Phaser.Game(config);