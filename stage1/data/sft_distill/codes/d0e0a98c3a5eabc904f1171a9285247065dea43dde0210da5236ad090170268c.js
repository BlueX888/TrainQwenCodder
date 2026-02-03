class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.explosionCount = 0;
  }

  preload() {
    // 初始化验证信号
    window.__signals__ = {
      explosionCount: 0,
      particlesEmitted: 0,
      enemyAlive: true,
      lastExplosionTime: 0,
      particleLifespan: 1500
    };
  }

  create() {
    // 创建红色敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(20, 20, 20);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建粒子纹理（黄色小圆点）
    const particleGraphics = this.add.graphics();
    particleGraphics.fillStyle(0xffff00, 1);
    particleGraphics.fillCircle(4, 4, 4);
    particleGraphics.generateTexture('particle', 8, 8);
    particleGraphics.destroy();

    // 创建红色敌人
    this.enemy = this.add.sprite(400, 300, 'enemy');
    this.enemy.setScale(1.5);

    // 创建粒子发射器
    this.particles = this.add.particles('particle');
    
    this.emitter = this.particles.createEmitter({
      speed: { min: 100, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 1500,
      gravityY: 0,
      quantity: 5,
      frequency: -1, // 不自动发射，只通过explode触发
      blendMode: 'ADD'
    });

    // 停止自动发射
    this.emitter.stop();

    // 添加提示文本
    this.add.text(10, 10, 'Press SPACE to kill enemy', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    this.statusText = this.add.text(10, 40, '', {
      fontSize: '16px',
      fill: '#00ff00'
    });

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    this.spaceKey.on('down', () => {
      if (this.enemy.visible) {
        this.killEnemy();
      }
    });

    // 更新状态文本
    this.updateStatus();
  }

  killEnemy() {
    // 触发粒子爆炸
    this.emitter.explode(5, this.enemy.x, this.enemy.y);
    
    // 隐藏敌人
    this.enemy.setVisible(false);
    
    // 更新验证信号
    this.explosionCount++;
    window.__signals__.explosionCount = this.explosionCount;
    window.__signals__.particlesEmitted += 5;
    window.__signals__.enemyAlive = false;
    window.__signals__.lastExplosionTime = this.time.now;

    // 输出日志
    console.log(JSON.stringify({
      event: 'enemy_death',
      explosionCount: this.explosionCount,
      particlesEmitted: window.__signals__.particlesEmitted,
      timestamp: this.time.now,
      position: { x: this.enemy.x, y: this.enemy.y }
    }));

    // 更新状态文本
    this.updateStatus();

    // 1.5秒后重生敌人
    this.time.delayedCall(1500, () => {
      this.respawnEnemy();
    });
  }

  respawnEnemy() {
    // 随机位置重生敌人
    const x = Phaser.Math.Between(100, 700);
    const y = Phaser.Math.Between(100, 500);
    
    this.enemy.setPosition(x, y);
    this.enemy.setVisible(true);
    
    // 更新验证信号
    window.__signals__.enemyAlive = true;

    // 输出日志
    console.log(JSON.stringify({
      event: 'enemy_respawn',
      position: { x: x, y: y },
      timestamp: this.time.now
    }));

    // 更新状态文本
    this.updateStatus();
  }

  updateStatus() {
    const status = `Explosions: ${this.explosionCount} | Enemy Alive: ${this.enemy.visible} | Particles: ${window.__signals__.particlesEmitted}`;
    this.statusText.setText(status);
  }

  update(time, delta) {
    // 可选：添加粒子计数更新逻辑
    if (this.emitter) {
      const aliveParticles = this.emitter.getAliveParticleCount();
      if (aliveParticles > 0) {
        // 粒子存活时的逻辑
      }
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  }
};

new Phaser.Game(config);