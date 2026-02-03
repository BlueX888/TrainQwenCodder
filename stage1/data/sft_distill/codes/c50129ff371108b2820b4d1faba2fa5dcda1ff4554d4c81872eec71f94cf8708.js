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
let killCount = 0;
let enemy;
let particleEmitter;
let statusText;

function preload() {
  // 使用 Graphics 创建灰色敌人纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillCircle(20, 20, 20);
  graphics.generateTexture('enemy', 40, 40);
  graphics.destroy();

  // 创建粒子纹理（红色小圆点）
  const particleGraphics = this.add.graphics();
  particleGraphics.fillStyle(0xff6600, 1); // 橙红色
  particleGraphics.fillCircle(4, 4, 4);
  particleGraphics.generateTexture('particle', 8, 8);
  particleGraphics.destroy();
}

function create() {
  // 创建状态文本
  statusText = this.add.text(10, 10, 'Kill Count: 0\nClick enemy to destroy', {
    fontSize: '18px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 创建粒子发射器（初始不发射）
  particleEmitter = this.add.particles(0, 0, 'particle', {
    speed: { min: 100, max: 200 },
    angle: { min: 0, max: 360 },
    scale: { start: 1, end: 0 },
    alpha: { start: 1, end: 0 },
    lifespan: 2000, // 持续2秒
    quantity: 3, // 每次发射3个粒子
    frequency: -1, // 不自动发射，手动触发
    blendMode: 'ADD'
  });

  // 创建灰色敌人
  enemy = this.physics.add.sprite(400, 300, 'enemy');
  enemy.setInteractive();

  // 添加提示文本
  const hintText = this.add.text(400, 500, 'Click the gray enemy to trigger particle explosion', {
    fontSize: '16px',
    color: '#ffff00'
  });
  hintText.setOrigin(0.5);

  // 点击敌人触发死亡效果
  enemy.on('pointerdown', () => {
    triggerEnemyDeath(this);
  });

  // 添加键盘快捷键（空格键）
  this.input.keyboard.on('keydown-SPACE', () => {
    if (enemy.active) {
      triggerEnemyDeath(this);
    }
  });

  // 添加说明文本
  this.add.text(400, 550, 'Press SPACE or Click to trigger explosion', {
    fontSize: '14px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

function triggerEnemyDeath(scene) {
  if (!enemy.active) return;

  // 记录敌人位置
  const x = enemy.x;
  const y = enemy.y;

  // 隐藏敌人
  enemy.setActive(false);
  enemy.setVisible(false);

  // 在敌人位置触发粒子爆炸
  particleEmitter.setPosition(x, y);
  particleEmitter.explode(3); // 发射3个粒子

  // 更新击杀计数
  killCount++;
  statusText.setText(`Kill Count: ${killCount}\nParticles exploding...`);

  // 2秒后重新生成敌人
  scene.time.delayedCall(2000, () => {
    respawnEnemy(scene);
  });
}

function respawnEnemy(scene) {
  // 随机位置重生敌人
  const x = Phaser.Math.Between(100, 700);
  const y = Phaser.Math.Between(100, 500);

  enemy.setPosition(x, y);
  enemy.setActive(true);
  enemy.setVisible(true);

  // 添加重生动画
  enemy.setScale(0);
  scene.tweens.add({
    targets: enemy,
    scale: 1,
    duration: 300,
    ease: 'Back.easeOut'
  });

  // 更新状态文本
  statusText.setText(`Kill Count: ${killCount}\nClick enemy to destroy`);
}

function update(time, delta) {
  // 敌人缓慢旋转（视觉效果）
  if (enemy.active) {
    enemy.rotation += 0.01;
  }
}

// 启动游戏
new Phaser.Game(config);