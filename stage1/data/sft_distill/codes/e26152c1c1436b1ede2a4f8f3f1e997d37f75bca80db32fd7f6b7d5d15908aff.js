class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentWave = 1;
    this.enemiesPerWave = 8;
    this.waveDelay = 2000;
    this.isWaveTransition = false;
    this.enemySpeed = 200;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建纹理
    this.createTextures();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'playerTex');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bulletTex',
      maxSize: 20
    });

    // 创建UI文本
    this.waveText = this.add.text(16, 16, `Wave: ${this.currentWave}`, {
      fontSize: '32px',
      fill: '#fff',
      fontFamily: 'Arial'
    });

    this.enemyCountText = this.add.text(16, 56, `Enemies: ${this.enemiesPerWave}`, {
      fontSize: '24px',
      fill: '#fff',
      fontFamily: 'Arial'
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 设置输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 添加碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);

    // 生成第一波敌人
    this.spawnWave();

    // 用于验证的状态变量
    this.totalEnemiesKilled = 0;
    this.score = 0;
  }

  createTextures() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('playerTex', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（灰色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x808080, 1);
    enemyGraphics.fillCircle(20, 20, 20);
    enemyGraphics.generateTexture('enemyTex', 40, 40);
    enemyGraphics.destroy();

    // 创建子弹纹理（黄色小方块）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillRect(0, 0, 8, 16);
    bulletGraphics.generateTexture('bulletTex', 8, 16);
    bulletGraphics.destroy();
  }

  spawnWave() {
    this.isWaveTransition = false;
    this.statusText.setText('');

    // 生成8个敌人
    for (let i = 0; i < this.enemiesPerWave; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(-200, -50);
      
      const enemy = this.enemies.create(x, y, 'enemyTex');
      enemy.setVelocity(
        Phaser.Math.Between(-50, 50),
        this.enemySpeed
      );
      enemy.setBounce(1, 0);
      enemy.setCollideWorldBounds(true);
    }

    this.updateEnemyCount();
  }

  hitEnemy(bullet, enemy) {
    // 销毁子弹和敌人
    bullet.destroy();
    enemy.destroy();

    // 更新统计
    this.totalEnemiesKilled++;
    this.score += 10;

    // 更新敌人计数
    this.updateEnemyCount();

    // 检查是否所有敌人都被消灭
    if (this.enemies.countActive(true) === 0 && !this.isWaveTransition) {
      this.onWaveComplete();
    }
  }

  updateEnemyCount() {
    const activeEnemies = this.enemies.countActive(true);
    this.enemyCountText.setText(`Enemies: ${activeEnemies}`);
  }

  onWaveComplete() {
    this.isWaveTransition = true;
    this.statusText.setText('Wave Complete!\nNext wave in 2s...');

    // 2秒后开始下一波
    this.time.addEvent({
      delay: this.waveDelay,
      callback: () => {
        this.currentWave++;
        this.waveText.setText(`Wave: ${this.currentWave}`);
        this.spawnWave();
      },
      callbackScope: this
    });
  }

  shootBullet() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 30);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
      
      // 子弹超出屏幕后销毁
      this.time.addEvent({
        delay: 2000,
        callback: () => {
          if (bullet.active) {
            bullet.destroy();
          }
        }
      });
    }
  }

  update(time, delta) {
    if (!this.player || !this.player.active) return;

    // 玩家移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300);
    } else {
      this.player.setVelocityX(0);
    }

    // 射击
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.shootBullet();
    }

    // 清理超出屏幕底部的敌人
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.y > 650) {
        enemy.y = Phaser.Math.Between(-200, -50);
        enemy.x = Phaser.Math.Between(50, 750);
      }
    });

    // 清理超出屏幕的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.y < -20) {
        bullet.destroy();
      }
    });
  }

  // 可验证的状态获取方法
  getGameState() {
    return {
      currentWave: this.currentWave,
      totalEnemiesKilled: this.totalEnemiesKilled,
      score: this.score,
      activeEnemies: this.enemies.countActive(true),
      isWaveTransition: this.isWaveTransition
    };
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

const game = new Phaser.Game(config);

// 暴露游戏状态用于验证（可选）
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return scene.getGameState ? scene.getGameState() : null;
};