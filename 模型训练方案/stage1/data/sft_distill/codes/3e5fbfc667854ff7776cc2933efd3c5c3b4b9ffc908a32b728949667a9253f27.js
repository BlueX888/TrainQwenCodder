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

// 游戏状态变量
let bulletsFired = 0;  // 已发射子弹总数
let activeBullets = 0; // 当前活跃子弹数
let bulletsRecycled = 0; // 已回收子弹数

let bullets;
let statsText;

function preload() {
  // 使用 Graphics 创建紫色子弹纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9933ff, 1); // 紫色
  graphics.fillCircle(8, 8, 8); // 绘制半径为8的圆
  graphics.generateTexture('bullet', 16, 16);
  graphics.destroy();
}

function create() {
  // 创建物理组作为对象池
  bullets = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 50, // 对象池最大容量
    runChildUpdate: false
  });

  // 添加鼠标点击事件监听
  this.input.on('pointerdown', (pointer) => {
    // 只响应左键点击
    if (pointer.leftButtonDown()) {
      fireBullet.call(this, pointer.x, pointer.y);
    }
  });

  // 创建状态显示文本
  statsText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 添加提示文本
  this.add.text(400, 300, '点击鼠标左键发射紫色子弹', {
    fontSize: '24px',
    fill: '#9933ff'
  }).setOrigin(0.5);

  updateStats();
}

function update(time, delta) {
  // 检查所有活跃的子弹
  bullets.children.entries.forEach((bullet) => {
    if (bullet.active) {
      // 检查子弹是否离开边界
      if (bullet.x < -20 || bullet.x > 820 || 
          bullet.y < -20 || bullet.y > 620) {
        // 回收子弹
        recycleBullet(bullet);
      }
    }
  });

  updateStats();
}

function fireBullet(targetX, targetY) {
  // 从对象池获取子弹
  const bullet = bullets.get(400, 300);
  
  if (bullet) {
    // 激活子弹
    bullet.setActive(true);
    bullet.setVisible(true);
    
    // 计算发射方向
    const angle = Phaser.Math.Angle.Between(400, 300, targetX, targetY);
    
    // 设置子弹速度（速度为360）
    const velocityX = Math.cos(angle) * 360;
    const velocityY = Math.sin(angle) * 360;
    
    bullet.setVelocity(velocityX, velocityY);
    
    // 更新统计
    bulletsFired++;
    activeBullets++;
    
    console.log(`子弹发射: 总数=${bulletsFired}, 活跃=${activeBullets}, 回收=${bulletsRecycled}`);
  }
}

function recycleBullet(bullet) {
  // 停止子弹运动
  bullet.setVelocity(0, 0);
  
  // 停用子弹（返回对象池）
  bullet.setActive(false);
  bullet.setVisible(false);
  
  // 更新统计
  activeBullets--;
  bulletsRecycled++;
  
  console.log(`子弹回收: 总数=${bulletsFired}, 活跃=${activeBullets}, 回收=${bulletsRecycled}`);
}

function updateStats() {
  statsText.setText([
    `已发射子弹: ${bulletsFired}`,
    `活跃子弹: ${activeBullets}`,
    `已回收子弹: ${bulletsRecycled}`,
    `对象池大小: ${bullets.getLength()}`
  ]);
}

// 启动游戏
new Phaser.Game(config);