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

// 全局信号对象
window.__signals__ = {
  explosions: [],
  particleStates: [],
  enemiesKilled: 0
};

let enemy;
let particleEmitter;
let explosionCount = 0;

function preload() {
  // 创建红色敌人纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillCircle(16, 16, 16);
  graphics.generateTexture('enemy', 32, 32);
  graphics.destroy();

  // 创建粒子纹理（橙色小圆点）
  const particleGraphics = this.add.graphics();
  particleGraphics.fillStyle(0xff6600, 1);
  particleGraphics.fillCircle(4, 4, 4);
  particleGraphics.generateTexture('particle', 8, 8);
  particleGraphics.destroy();
}

function create() {
  // 添加说明文字
  this.add.text(400, 50, 'Click the red enemy to trigger explosion', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);

  this.add.text(400, 80, 'Each explosion: 5 particles, 1.5s duration', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);

  // 创建红色敌人
  enemy = this.physics.add.sprite(400, 300, 'enemy');
  enemy.setInteractive();

  // 创建粒子发射器（初始不发射）
  particleEmitter = this.add.particles(0, 0, 'particle', {
    speed: { min: 100, max: 200 },
    angle: { min: 0, max: 360 },
    scale: { start: 1, end: 0 },
    alpha: { start: 1, end: 0 },
    lifespan: 1500, // 持续1.5秒
    gravityY: 0,
    quantity: 5, // 每次发射5个粒子
    frequency: -1, // 手动触发，不自动发射
    blendMode: 'ADD'
  });

  // 监听粒子死亡事件
  particleEmitter.onParticleDeath((particle) => {
    window.__signals__.particleStates.push({
      timestamp: Date.now(),
      explosionId: particle.explosionId,
      particleId: particle.particleId,
      finalX: particle.x,
      finalY: particle.y,
      lifespan: particle.lifespan
    });
  });

  // 点击敌人触发爆炸
  enemy.on('pointerdown', () => {
    triggerExplosion.call(this, enemy.x, enemy.y);
    
    // 敌人死亡后重新生成
    window.__signals__.enemiesKilled++;
    
    // 随机位置重生敌人
    const newX = Phaser.Math.Between(100, 700);
    const newY = Phaser.Math.Between(150, 450);
    enemy.setPosition(newX, newY);
    
    // 添加重生动画
    enemy.setAlpha(0);
    this.tweens.add({
      targets: enemy,
      alpha: 1,
      duration: 300,
      ease: 'Power2'
    });
  });

  // 显示统计信息
  const statsText = this.add.text(10, 10, '', {
    fontSize: '14px',
    color: '#00ff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  this.time.addEvent({
    delay: 100,
    callback: () => {
      statsText.setText([
        `Enemies Killed: ${window.__signals__.enemiesKilled}`,
        `Total Explosions: ${window.__signals__.explosions.length}`,
        `Particles Emitted: ${window.__signals__.particleStates.length}`
      ]);
    },
    loop: true
  });
}

function triggerExplosion(x, y) {
  explosionCount++;
  const explosionId = `explosion_${explosionCount}`;
  
  // 记录爆炸事件
  window.__signals__.explosions.push({
    id: explosionId,
    timestamp: Date.now(),
    x: x,
    y: y,
    particleCount: 5,
    duration: 1500
  });

  // 在指定位置发射粒子
  particleEmitter.setPosition(x, y);
  
  // 发射5个粒子
  const particles = particleEmitter.explode(5, x, y);
  
  // 为每个粒子添加标识
  particles.forEach((particle, index) => {
    particle.explosionId = explosionId;
    particle.particleId = `${explosionId}_particle_${index}`;
  });

  // 添加爆炸闪光效果
  const flash = this.add.circle(x, y, 30, 0xffff00, 0.8);
  this.tweens.add({
    targets: flash,
    scale: 2,
    alpha: 0,
    duration: 300,
    ease: 'Power2',
    onComplete: () => {
      flash.destroy();
    }
  });

  // 添加震动效果
  this.cameras.main.shake(200, 0.005);

  // 输出日志
  console.log(JSON.stringify({
    event: 'explosion',
    id: explosionId,
    position: { x, y },
    particles: 5,
    timestamp: Date.now()
  }));
}

function update(time, delta) {
  // 可以在这里添加额外的更新逻辑
}

const game = new Phaser.Game(config);