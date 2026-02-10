class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentWave = 0;
    this.enemiesInWave = 8;
    this.enemySpeed = 160;
    this.waveDelay = 2000; // 2秒
    this.isWaveActive = false;
    this.remainingEnemies = 0;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x808080, 1); // 灰色
    enemyGraphics.fillRect(0, 0, 30, 30);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 30
    });

    // 碰撞检测：子弹击中敌人
    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
    this.lastFired = 0;

    // UI文本
    this.waveText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff'
    });
    this.enemyCountText = this.add.text(16, 50, '', {
      fontSize: '20px',
      fill: '#ffffff'
    });
    this.statusText = this.add.text(16, 80, '', {
      fontSize: '18px',
      fill: '#ffff00'
    });

    // 开始第一波
    this.startNextWave();
  }

  update(time, delta) {
    // 玩家移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-200);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(200);
    } else {
      this.player.setVelocityY(0);
    }

    // 射击
    if (this.spaceKey.isDown && time > this.lastFired + 200) {
      this.fireBullet();
      this.lastFired = time;
    }

    // 敌人移动逻辑
    this.enemies.children.entries.forEach((enemy) => {
      if (enemy.active) {
        // 简单的追踪玩家逻辑
        const angle = Phaser.Math.Angle.Between(
          enemy.x,
          enemy.y,
          this.player.x,
          this.player.y
        );
        this.physics.velocityFromRotation(
          angle,
          this.enemySpeed,
          enemy.body.velocity
        );
      }
    });

    // 更新UI
    this.updateUI();

    // 检查是否需要开始下一波
    if (this.isWaveActive && this.remainingEnemies === 0) {
      this.isWaveActive = false;
      this.statusText.setText('Wave Complete! Next wave in 2s...');
      
      // 2秒后开始下一波
      this.time.addEvent({
        delay: this.waveDelay,
        callback: this.startNextWave,
        callbackScope: this
      });
    }
  }

  startNextWave() {
    this.currentWave++;
    this.isWaveActive = true;
    this.remainingEnemies = this.enemiesInWave;
    this.statusText.setText('Wave Active!');

    // 生成敌人
    for (let i = 0; i < this.enemiesInWave; i++) {
      this.spawnEnemy(i);
    }
  }

  spawnEnemy(index) {
    // 在屏幕上方随机位置生成敌人
    const x = 100 + (index * 80) + Phaser.Math.Between(-20, 20);
    const y = 50 + Phaser.Math.Between(-30, 30);
    
    const enemy = this.enemies.create(x, y, 'enemy');
    enemy.setCollideWorldBounds(true);
    enemy.setBounce(0.5);
  }

  fireBullet() {
    const bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.velocity.y = -400;
      
      // 子弹超出屏幕后回收
      this.time.addEvent({
        delay: 2000,
        callback: () => {
          if (bullet.active) {
            bullet.setActive(false);
            bullet.setVisible(false);
          }
        }
      });
    }
  }

  hitEnemy(bullet, enemy) {
    // 销毁子弹和敌人
    bullet.setActive(false);
    bullet.setVisible(false);
    enemy.destroy();
    
    // 减少剩余敌人数量
    this.remainingEnemies--;
  }

  updateUI() {
    this.waveText.setText(`Wave: ${this.currentWave}`);
    this.enemyCountText.setText(
      `Enemies Remaining: ${this.remainingEnemies}`
    );
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

// 可验证的状态信号
console.log('Game initialized with wave system');
console.log('Wave config:', {
  enemiesPerWave: 8,
  enemySpeed: 160,
  waveDelay: 2000
});