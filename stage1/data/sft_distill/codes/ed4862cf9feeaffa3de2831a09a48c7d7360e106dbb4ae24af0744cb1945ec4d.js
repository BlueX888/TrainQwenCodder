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

// 全局验证信号
window.__signals__ = {
  explosionCount: 0,
  particlesEmitted: 0,
  enemiesDestroyed: 0,
  events: []
};

let enemy;
let particleEmitter;
let infoText;

function preload() {
  // 创建绿色敌人纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(16, 16, 16);
  graphics.generateTexture('greenEnemy', 32, 32);
  graphics.destroy();

  // 创建粒子纹理（红色小圆点）
  const particleGraphics = this.add.graphics();
  particleGraphics.fillStyle(0xff6600, 1);
  particleGraphics.fillCircle(4, 4, 4);
  particleGraphics.generateTexture('particle', 8, 8);
  particleGraphics.destroy();
}

function create() {
  // 创建绿色敌人
  enemy = this.physics.add.sprite(400, 300, 'greenEnemy');
  enemy.setInteractive();
  enemy.setCollideWorldBounds(true);

  // 创建粒子发射器（初始状态为关闭）
  particleEmitter = this.add.particles(0, 0, 'particle', {
    speed: { min: 100, max: 200 },
    angle: { min: 0, max: 360 },
    scale: { start: 1, end: 0 },
    alpha: { start: 1, end: 0 },
    lifespan: 2000, // 持续2秒
    gravityY: 0,
    quantity: 5, // 每次发射5个粒子
    frequency: -1, // 手动触发，不自动发射
    blendMode: 'ADD'
  });

  // 监听敌人点击事件
  enemy.on('pointerdown', () => {
    triggerExplosion(enemy.x, enemy.y);
  });

  // 信息文本
  infoText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff'
  });

  updateInfoText();

  // 记录初始化事件
  window.__signals__.events.push({
    type: 'scene_created',
    timestamp: Date.now(),
    enemyPosition: { x: enemy.x, y: enemy.y }
  });
}

function update(time, delta) {
  updateInfoText();
}

function triggerExplosion(x, y) {
  // 记录爆炸事件
  window.__signals__.explosionCount++;
  window.__signals__.enemiesDestroyed++;
  window.__signals__.particlesEmitted += 5;

  window.__signals__.events.push({
    type: 'explosion_triggered',
    timestamp: Date.now(),
    position: { x, y },
    particleCount: 5,
    explosionNumber: window.__signals__.explosionCount
  });

  // 在敌人位置发射粒子
  particleEmitter.setPosition(x, y);
  particleEmitter.explode(5); // 一次性发射5个粒子

  // 销毁敌人
  enemy.destroy();

  // 2秒后重新创建敌人（演示可重复触发）
  setTimeout(() => {
    if (enemy.scene) {
      enemy = enemy.scene.physics.add.sprite(
        Phaser.Math.Between(100, 700),
        Phaser.Math.Between(100, 500),
        'greenEnemy'
      );
      enemy.setInteractive();
      enemy.setCollideWorldBounds(true);

      enemy.on('pointerdown', () => {
        triggerExplosion(enemy.x, enemy.y);
      });

      window.__signals__.events.push({
        type: 'enemy_respawned',
        timestamp: Date.now(),
        position: { x: enemy.x, y: enemy.y }
      });
    }
  }, 2500);

  console.log('Explosion triggered!', JSON.stringify(window.__signals__, null, 2));
}

function updateInfoText() {
  infoText.setText([
    'Click the green enemy to trigger explosion',
    `Explosions: ${window.__signals__.explosionCount}`,
    `Particles Emitted: ${window.__signals__.particlesEmitted}`,
    `Enemies Destroyed: ${window.__signals__.enemiesDestroyed}`,
    '',
    'Effect: 5 particles spread in all directions for 2 seconds'
  ]);
}

const game = new Phaser.Game(config);