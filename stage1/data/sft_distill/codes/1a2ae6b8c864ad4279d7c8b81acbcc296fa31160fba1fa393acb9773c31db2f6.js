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

// 状态变量
let bulletsFired = 0;
let bulletsActive = 0;

// 子弹组
let bullets;

// 文本显示
let statsText;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建紫色子弹纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9933ff, 1); // 紫色
  graphics.fillCircle(8, 8, 8); // 半径8的圆形
  graphics.generateTexture('bullet', 16, 16);
  graphics.destroy();

  // 创建子弹对象池（使用物理组）
  bullets = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 50, // 对象池最大容量
    runChildUpdate: false
  });

  // 监听鼠标左键点击
  this.input.on('pointerdown', (pointer) => {
    if (pointer.leftButtonDown()) {
      fireBullet.call(this, pointer.x, pointer.y);
    }
  });

  // 创建状态显示文本
  statsText = this.add.text(10, 10, '', {
    fontSize: '18px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 添加提示文本
  this.add.text(400, 300, 'Click to Fire Bullets', {
    fontSize: '24px',
    fill: '#9933ff'
  }).setOrigin(0.5);

  updateStats();
}

function update(time, delta) {
  // 检查子弹是否离开边界
  bullets.children.entries.forEach((bullet) => {
    if (bullet.active) {
      // 检测是否离开屏幕边界
      if (bullet.x < -20 || bullet.x > 820 || 
          bullet.y < -20 || bullet.y > 620) {
        // 回收子弹到对象池
        bullet.setActive(false);
        bullet.setVisible(false);
        bullet.body.stop();
        bulletsActive--;
        updateStats();
      }
    }
  });
}

/**
 * 发射子弹
 * @param {number} targetX - 目标X坐标
 * @param {number} targetY - 目标Y坐标
 */
function fireBullet(targetX, targetY) {
  // 从对象池获取子弹（如果池中没有会自动创建新的）
  const bullet = bullets.get(400, 300);
  
  if (bullet) {
    // 激活子弹
    bullet.setActive(true);
    bullet.setVisible(true);
    
    // 计算发射方向
    const angle = Phaser.Math.Angle.Between(400, 300, targetX, targetY);
    
    // 设置速度（速度360）
    const velocityX = Math.cos(angle) * 360;
    const velocityY = Math.sin(angle) * 360;
    
    bullet.setVelocity(velocityX, velocityY);
    
    // 更新统计
    bulletsFired++;
    bulletsActive++;
    updateStats();
  }
}

/**
 * 更新状态显示
 */
function updateStats() {
  statsText.setText([
    `Bullets Fired: ${bulletsFired}`,
    `Active Bullets: ${bulletsActive}`,
    `Pool Size: ${bullets.getLength()}`,
    `Pool Max: ${bullets.maxSize}`
  ]);
}

// 启动游戏
new Phaser.Game(config);