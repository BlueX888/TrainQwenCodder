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

// 全局状态变量（可验证）
let bulletsFired = 0;
let activeBullets = 0;

let bulletsGroup;
let bulletSpeed = 120;

function preload() {
  // 使用 Graphics 创建粉色子弹纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillCircle(8, 8, 8); // 半径为8的圆形
  graphics.generateTexture('bullet', 16, 16);
  graphics.destroy();
}

function create() {
  // 创建物理组作为对象池
  bulletsGroup = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 50, // 对象池最大容量
    runChildUpdate: false
  });

  // 监听鼠标左键点击事件
  this.input.on('pointerdown', (pointer) => {
    if (pointer.leftButtonDown()) {
      fireBullet.call(this, pointer.x, pointer.y);
    }
  });

  // 添加提示文字
  this.add.text(10, 10, 'Click to fire pink bullets', {
    fontSize: '18px',
    color: '#ffffff'
  });

  // 显示状态信息
  this.statusText = this.add.text(10, 40, '', {
    fontSize: '16px',
    color: '#00ff00'
  });
}

function fireBullet(targetX, targetY) {
  // 从对象池获取子弹（如果池中没有，会自动创建）
  const bullet = bulletsGroup.get(400, 300);
  
  if (bullet) {
    bullet.setActive(true);
    bullet.setVisible(true);
    
    // 计算发射方向
    const angle = Phaser.Math.Angle.Between(400, 300, targetX, targetY);
    
    // 设置子弹速度
    this.physics.velocityFromRotation(angle, bulletSpeed, bullet.body.velocity);
    
    // 更新状态
    bulletsFired++;
    activeBullets = bulletsGroup.countActive(true);
    
    console.log(`Bullet fired! Total: ${bulletsFired}, Active: ${activeBullets}`);
  }
}

function update() {
  // 检查所有活跃的子弹
  bulletsGroup.children.entries.forEach((bullet) => {
    if (bullet.active) {
      // 检查是否离开边界
      if (bullet.x < -20 || bullet.x > 820 || 
          bullet.y < -20 || bullet.y > 620) {
        // 回收到对象池
        bulletsGroup.killAndHide(bullet);
        bullet.body.reset(0, 0);
        activeBullets = bulletsGroup.countActive(true);
      }
    }
  });

  // 更新状态显示
  if (this.statusText) {
    this.statusText.setText(
      `Bullets Fired: ${bulletsFired}\n` +
      `Active Bullets: ${activeBullets}\n` +
      `Pool Size: ${bulletsGroup.getLength()}`
    );
  }
}

// 启动游戏
const game = new Phaser.Game(config);