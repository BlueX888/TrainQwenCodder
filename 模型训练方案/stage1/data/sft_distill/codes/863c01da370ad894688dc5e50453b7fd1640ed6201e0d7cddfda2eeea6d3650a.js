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

let boss;
let bullets;
let bossHealth = 12;
let healthText;
let victoryText;
let gameOver = false;

function preload() {
  // 创建Boss纹理（粉色圆形）
  const bossGraphics = this.add.graphics();
  bossGraphics.fillStyle(0xFF69B4, 1); // 粉色
  bossGraphics.fillCircle(50, 50, 50);
  bossGraphics.generateTexture('boss', 100, 100);
  bossGraphics.destroy();

  // 创建子弹纹理（黄色小圆）
  const bulletGraphics = this.add.graphics();
  bulletGraphics.fillStyle(0xFFFF00, 1); // 黄色
  bulletGraphics.fillCircle(5, 5, 5);
  bulletGraphics.generateTexture('bullet', 10, 10);
  bulletGraphics.destroy();
}

function create() {
  // 创建Boss
  boss = this.physics.add.sprite(400, 200, 'boss');
  boss.setCollideWorldBounds(true);
  
  // Boss简单移动动画
  this.tweens.add({
    targets: boss,
    x: 600,
    duration: 2000,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  });

  // 创建子弹组
  bullets = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 50
  });

  // 创建血量显示
  healthText = this.add.text(16, 16, `Boss Health: ${bossHealth}`, {
    fontSize: '24px',
    fill: '#fff',
    fontFamily: 'Arial'
  });

  // 创建胜利文本（初始隐藏）
  victoryText = this.add.text(400, 300, 'VICTORY!', {
    fontSize: '64px',
    fill: '#00ff00',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });
  victoryText.setOrigin(0.5);
  victoryText.setVisible(false);

  // 创建提示文本
  this.add.text(400, 550, 'Click to shoot bullets at the Boss!', {
    fontSize: '20px',
    fill: '#aaa',
    fontFamily: 'Arial'
  }).setOrigin(0.5);

  // 鼠标点击发射子弹
  this.input.on('pointerdown', (pointer) => {
    if (!gameOver) {
      shootBullet.call(this, pointer.x, pointer.y);
    }
  });

  // 碰撞检测
  this.physics.add.overlap(bullets, boss, hitBoss, null, this);
}

function update(time, delta) {
  // 清理飞出屏幕的子弹
  bullets.children.entries.forEach((bullet) => {
    if (bullet.active && (bullet.y < -50 || bullet.y > 650 || bullet.x < -50 || bullet.x > 850)) {
      bullet.destroy();
    }
  });
}

function shootBullet(targetX, targetY) {
  // 从屏幕底部中央发射子弹
  const startX = 400;
  const startY = 580;
  
  const bullet = bullets.get(startX, startY, 'bullet');
  
  if (bullet) {
    bullet.setActive(true);
    bullet.setVisible(true);
    
    // 计算方向向量
    const angle = Phaser.Math.Angle.Between(startX, startY, targetX, targetY);
    
    // 设置速度为300
    this.physics.velocityFromRotation(angle, 300, bullet.body.velocity);
  }
}

function hitBoss(bullet, boss) {
  // 销毁子弹
  bullet.destroy();
  
  // 扣血
  bossHealth--;
  healthText.setText(`Boss Health: ${bossHealth}`);
  
  // Boss受击闪烁效果
  this.tweens.add({
    targets: boss,
    alpha: 0.5,
    duration: 100,
    yoyo: true,
    repeat: 1
  });
  
  // 检查是否胜利
  if (bossHealth <= 0) {
    gameOver = true;
    victoryText.setVisible(true);
    
    // Boss消失动画
    this.tweens.add({
      targets: boss,
      alpha: 0,
      scale: 0,
      duration: 500,
      onComplete: () => {
        boss.destroy();
      }
    });
    
    // 停止所有子弹
    bullets.children.entries.forEach((bullet) => {
      if (bullet.active) {
        bullet.body.setVelocity(0, 0);
      }
    });
  }
}

const game = new Phaser.Game(config);