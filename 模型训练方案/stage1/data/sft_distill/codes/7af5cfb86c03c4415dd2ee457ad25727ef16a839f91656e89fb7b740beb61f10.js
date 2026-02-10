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
let bulletsActive = 0;
let bulletsGroup;
let statusText;

function preload() {
  // 使用 Graphics 生成粉色子弹纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillCircle(8, 8, 8); // 半径为8的圆形
  graphics.generateTexture('bullet', 16, 16);
  graphics.destroy();
}

function create() {
  // 创建子弹对象池（使用 Physics Group）
  bulletsGroup = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 50, // 对象池最大容量
    runChildUpdate: false,
    createCallback: function(bullet) {
      // 子弹离开屏幕边界时自动回收
      bullet.setActive(false);
      bullet.setVisible(false);
    }
  });

  // 监听鼠标左键点击事件
  this.input.on('pointerdown', (pointer) => {
    if (pointer.leftButtonDown()) {
      fireBullet.call(this, pointer.x, pointer.y);
    }
  });

  // 创建状态显示文本
  statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 添加提示文本
  this.add.text(400, 300, 'Click to Fire Pink Bullets', {
    fontSize: '24px',
    fill: '#ff69b4'
  }).setOrigin(0.5);

  // 初始化状态显示
  updateStatus();
}

function update() {
  // 检查并回收离开边界的子弹
  bulletsGroup.children.entries.forEach(bullet => {
    if (bullet.active) {
      const bounds = this.physics.world.bounds;
      if (bullet.x < bounds.x - 20 || 
          bullet.x > bounds.x + bounds.width + 20 ||
          bullet.y < bounds.y - 20 || 
          bullet.y > bounds.y + bounds.height + 20) {
        // 回收子弹到对象池
        bullet.setActive(false);
        bullet.setVisible(false);
        bullet.body.stop();
        bulletsActive--;
        updateStatus();
      }
    }
  });
}

function fireBullet(x, y) {
  // 从对象池获取子弹
  let bullet = bulletsGroup.get(x, y);
  
  if (bullet) {
    // 激活子弹
    bullet.setActive(true);
    bullet.setVisible(true);
    
    // 计算发射方向（从屏幕中心向鼠标位置）
    const centerX = 400;
    const centerY = 300;
    const angle = Phaser.Math.Angle.Between(centerX, centerY, x, y);
    
    // 设置子弹速度（速度为120）
    const speed = 120;
    bullet.body.setVelocity(
      Math.cos(angle) * speed,
      Math.sin(angle) * speed
    );
    
    // 更新状态
    bulletsFired++;
    bulletsActive++;
    updateStatus();
  }
}

function updateStatus() {
  if (statusText) {
    statusText.setText([
      `Bullets Fired: ${bulletsFired}`,
      `Active Bullets: ${bulletsActive}`,
      `Pool Size: ${bulletsGroup ? bulletsGroup.getLength() : 0}`
    ]);
  }
}

// 启动游戏
new Phaser.Game(config);