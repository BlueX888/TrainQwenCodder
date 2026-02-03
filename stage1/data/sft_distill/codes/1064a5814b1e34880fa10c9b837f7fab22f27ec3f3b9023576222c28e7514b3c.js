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
let activeBullets = 0;
let bulletsGroup;
let statsText;
let playerPos = { x: 400, y: 300 };

function preload() {
  // 创建橙色子弹纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff6600, 1);
  graphics.fillCircle(8, 8, 8);
  graphics.generateTexture('bullet', 16, 16);
  graphics.destroy();

  // 创建玩家纹理（用于显示发射点）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();
}

function create() {
  // 创建玩家精灵（作为发射点）
  const player = this.add.sprite(playerPos.x, playerPos.y, 'player');
  
  // 创建子弹对象池（Physics Group）
  bulletsGroup = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 50,
    runChildUpdate: false,
    createCallback: function(bullet) {
      bullet.setActive(false);
      bullet.setVisible(false);
    }
  });

  // 监听鼠标右键点击事件
  this.input.on('pointerdown', function(pointer) {
    if (pointer.rightButtonDown()) {
      fireBullet(pointer, this);
    }
  }, this);

  // 禁用右键菜单
  this.input.mouse.disableContextMenu();

  // 创建状态显示文本
  statsText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 添加说明文本
  this.add.text(10, 560, '右键点击发射橙色子弹（速度: 160）', {
    fontSize: '14px',
    fill: '#ffff00'
  });

  updateStats();
}

function update(time, delta) {
  // 检查并回收离开边界的子弹
  bulletsGroup.children.entries.forEach(bullet => {
    if (bullet.active) {
      if (bullet.x < -20 || bullet.x > 820 || 
          bullet.y < -20 || bullet.y > 620) {
        recycleBullet(bullet);
      }
    }
  });

  updateStats();
}

function fireBullet(pointer, scene) {
  // 从对象池获取子弹
  const bullet = bulletsGroup.get(playerPos.x, playerPos.y);
  
  if (bullet) {
    bullet.setActive(true);
    bullet.setVisible(true);
    
    // 计算从玩家位置到鼠标位置的方向向量
    const angle = Phaser.Math.Angle.Between(
      playerPos.x, 
      playerPos.y, 
      pointer.x, 
      pointer.y
    );
    
    // 设置子弹速度（速度为 160）
    const velocityX = Math.cos(angle) * 160;
    const velocityY = Math.sin(angle) * 160;
    
    bullet.body.setVelocity(velocityX, velocityY);
    
    // 更新统计
    bulletsFired++;
    activeBullets++;
    
    console.log(`子弹发射 #${bulletsFired} at (${pointer.x}, ${pointer.y})`);
  }
}

function recycleBullet(bullet) {
  if (bullet.active) {
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.setVelocity(0, 0);
    activeBullets--;
    console.log(`子弹回收，当前活跃: ${activeBullets}`);
  }
}

function updateStats() {
  if (statsText) {
    statsText.setText([
      `发射子弹总数: ${bulletsFired}`,
      `当前活跃子弹: ${activeBullets}`,
      `对象池大小: ${bulletsGroup.getLength()}`,
      `对象池使用: ${bulletsGroup.countActive(true)}/${bulletsGroup.maxSize}`
    ]);
  }
}

// 启动游戏
new Phaser.Game(config);