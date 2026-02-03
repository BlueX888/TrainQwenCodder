// 全局信号对象用于验证
window.__signals__ = {
  enemiesKilled: 0,
  particleExplosions: 0,
  lastExplosionTime: 0,
  explosionDetails: []
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.enemies = [];
  }

  preload() {
    // 创建红色敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(25, 25, 25);
    enemyGraphics.generateTexture('enemy', 50, 50);
    enemyGraphics.destroy();

    // 创建粒子纹理（橙红色小圆点）
    const particleGraphics = this.add.graphics();
    particleGraphics.fillStyle(0xff6600, 1);
    particleGraphics.fillCircle(4, 4, 4);
    particleGraphics.generateTexture('particle', 8, 8);
    particleGraphics.destroy();
  }

  create() {
    // 添加背景文字说明
    this.add.text(10, 10, 'Click on red enemies to trigger particle explosion', {
      fontSize: '16px',
      color: '#ffffff'
    });

    // 显示统计信息
    this.statsText = this.add.text(10, 40, '', {
      fontSize: '14px',
      color: '#00ff00'
    });

    // 创建3个红色敌人
    this.createEnemy(200, 300);
    this.createEnemy(400, 300);
    this.createEnemy(600, 300);

    // 更新统计信息
    this.updateStats();
  }

  createEnemy(x, y) {
    const enemy = this.add.sprite(x, y, 'enemy');
    enemy.setInteractive({ useHandCursor: true });
    
    // 添加悬停效果
    enemy.on('pointerover', () => {
      enemy.setScale(1.1);
    });
    
    enemy.on('pointerout', () => {
      enemy.setScale(1.0);
    });

    // 点击触发死亡和粒子爆炸
    enemy.on('pointerdown', () => {
      this.triggerEnemyDeath(enemy);
    });

    this.enemies.push(enemy);
  }

  triggerEnemyDeath(enemy) {
    if (enemy.isDying) return; // 防止重复触发
    enemy.isDying = true;

    const explosionX = enemy.x;
    const explosionY = enemy.y;
    const explosionTime = Date.now();

    // 记录信号
    window.__signals__.enemiesKilled++;
    window.__signals__.particleExplosions++;
    window.__signals__.lastExplosionTime = explosionTime;

    // 创建粒子发射器
    const emitter = this.add.particles(explosionX, explosionY, 'particle', {
      speed: { min: 100, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 1500,
      quantity: 5,
      frequency: -1, // 只发射一次
      blendMode: 'ADD'
    });

    // 立即发射5个粒子
    emitter.explode(5, explosionX, explosionY);

    // 记录爆炸详情
    const explosionDetail = {
      position: { x: explosionX, y: explosionY },
      particleCount: 5,
      timestamp: explosionTime,
      duration: 1500
    };
    window.__signals__.explosionDetails.push(explosionDetail);

    // 敌人淡出动画
    this.tweens.add({
      targets: enemy,
      alpha: 0,
      scale: 0.5,
      duration: 300,
      ease: 'Power2'
    });

    // 1.5秒后销毁敌人和粒子发射器
    this.time.delayedCall(1500, () => {
      enemy.destroy();
      emitter.destroy();
      
      // 从数组中移除
      const index = this.enemies.indexOf(enemy);
      if (index > -1) {
        this.enemies.splice(index, 1);
      }

      // 更新统计信息
      this.updateStats();

      // 如果所有敌人都被消灭，显示完成信息
      if (this.enemies.length === 0) {
        this.showCompletionMessage();
      }
    });

    // 更新统计信息
    this.updateStats();

    // 输出日志
    console.log('Particle Explosion:', JSON.stringify(explosionDetail));
  }

  updateStats() {
    const stats = window.__signals__;
    this.statsText.setText(
      `Enemies Killed: ${stats.enemiesKilled}\n` +
      `Explosions: ${stats.particleExplosions}\n` +
      `Remaining Enemies: ${this.enemies.length}`
    );
  }

  showCompletionMessage() {
    const message = this.add.text(400, 300, 'All Enemies Destroyed!\nReload to play again', {
      fontSize: '24px',
      color: '#ffff00',
      align: 'center'
    });
    message.setOrigin(0.5);

    // 闪烁效果
    this.tweens.add({
      targets: message,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // 输出最终信号
    console.log('Game Complete:', JSON.stringify(window.__signals__));
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  }
};

// 启动游戏
new Phaser.Game(config);