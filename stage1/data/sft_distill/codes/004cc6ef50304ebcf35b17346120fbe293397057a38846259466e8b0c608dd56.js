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

// 验证信号对象
window.__signals__ = {
  enemiesKilled: 0,
  particleEmissions: 0,
  events: []
};

let enemy;
let particleEmitter;
let cursors;

function preload() {
  // 创建绿色敌人纹理
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0x00ff00, 1);
  enemyGraphics.fillCircle(25, 25, 25);
  enemyGraphics.generateTexture('enemy', 50, 50);
  enemyGraphics.destroy();

  // 创建粒子纹理（红色小圆点）
  const particleGraphics = this.add.graphics();
  particleGraphics.fillStyle(0xff6600, 1);
  particleGraphics.fillCircle(5, 5, 5);
  particleGraphics.generateTexture('particle', 10, 10);
  particleGraphics.destroy();
}

function create() {
  // 添加标题文本
  this.add.text(400, 50, 'Click the Green Enemy to Kill', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 添加状态文本
  this.statusText = this.add.text(400, 100, 'Enemies Killed: 0', {
    fontSize: '18px',
    color: '#ffff00'
  }).setOrigin(0.5);

  // 创建绿色敌人
  enemy = this.physics.add.sprite(400, 300, 'enemy');
  enemy.setInteractive();
  enemy.alive = true;

  // 创建粒子发射器（初始不发射）
  particleEmitter = this.add.particles(0, 0, 'particle', {
    speed: { min: 100, max: 200 },
    angle: { min: 0, max: 360 },
    scale: { start: 1, end: 0 },
    alpha: { start: 1, end: 0 },
    lifespan: 2000, // 持续2秒
    gravityY: 0,
    quantity: 5, // 每次发射5个粒子
    frequency: -1, // 不自动发射，手动触发
    blendMode: 'ADD'
  });

  // 点击敌人触发死亡
  enemy.on('pointerdown', () => {
    if (enemy.alive) {
      killEnemy.call(this);
    }
  });

  // 添加说明文本
  this.add.text(400, 550, 'Click enemy to see particle explosion effect', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);

  // 记录初始化事件
  window.__signals__.events.push({
    type: 'init',
    timestamp: Date.now(),
    message: 'Game initialized'
  });
}

function update(time, delta) {
  // 游戏循环更新逻辑
}

function killEnemy() {
  if (!enemy.alive) return;

  enemy.alive = false;

  // 更新计数器
  window.__signals__.enemiesKilled++;
  window.__signals__.particleEmissions++;

  // 记录死亡事件
  window.__signals__.events.push({
    type: 'enemy_death',
    timestamp: Date.now(),
    position: { x: enemy.x, y: enemy.y },
    particleCount: 5
  });

  // 更新状态文本
  this.statusText.setText(`Enemies Killed: ${window.__signals__.enemiesKilled}`);

  // 在敌人位置发射粒子
  particleEmitter.emitParticleAt(enemy.x, enemy.y, 5);

  // 敌人淡出并缩小
  this.tweens.add({
    targets: enemy,
    alpha: 0,
    scale: 0,
    duration: 500,
    ease: 'Power2',
    onComplete: () => {
      // 2.5秒后重生敌人（粒子效果结束后）
      this.time.delayedCall(2000, () => {
        respawnEnemy.call(this);
      });
    }
  });

  // 输出日志
  console.log(JSON.stringify({
    event: 'particle_explosion',
    enemiesKilled: window.__signals__.enemiesKilled,
    particleCount: 5,
    duration: 2000,
    position: { x: enemy.x, y: enemy.y }
  }));
}

function respawnEnemy() {
  // 随机位置重生敌人
  const x = Phaser.Math.Between(100, 700);
  const y = Phaser.Math.Between(150, 450);
  
  enemy.setPosition(x, y);
  enemy.setAlpha(1);
  enemy.setScale(1);
  enemy.alive = true;

  // 重生动画
  enemy.setScale(0);
  this.tweens.add({
    targets: enemy,
    scale: 1,
    duration: 300,
    ease: 'Back.easeOut'
  });

  // 记录重生事件
  window.__signals__.events.push({
    type: 'enemy_respawn',
    timestamp: Date.now(),
    position: { x: enemy.x, y: enemy.y }
  });

  console.log(JSON.stringify({
    event: 'enemy_respawn',
    position: { x: x, y: y }
  }));
}

// 启动游戏
new Phaser.Game(config);