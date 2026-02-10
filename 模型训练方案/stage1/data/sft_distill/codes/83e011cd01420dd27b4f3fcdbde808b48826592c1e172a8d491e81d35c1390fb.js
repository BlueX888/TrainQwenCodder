class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.wave = 0;
    this.killCount = 0;
    this.enemiesInWave = 0;
    this.baseEnemySpeed = 200;
    this.isWaveActive = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 生成玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 生成敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 24, 24);
    enemyGraphics.generateTexture('enemy', 24, 24);
    enemyGraphics.destroy();

    // 生成子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group({
      defaultKey: 'enemy',
      maxSize: 100
    });

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 鼠标点击射击
    this.input.on('pointerdown', (pointer) => {
      this.shootBullet(pointer.x, pointer.y);
    });

    // 碰撞检测
    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.playerHit,
      null,
      this
    );

    // UI文本
    this.waveText = this.add.text(16, 16, 'Wave: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.killText = this.add.text(16, 48, 'Kills: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#ffff00',
      align: 'center'
    }).setOrigin(0.5);

    // 开始第一波
    this.startNextWave();
  }

  update(time, delta) {
    // 玩家移动
    const speed = 300;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    }

    // 敌人追踪玩家
    this.enemies.children.entries.forEach((enemy) => {
      if (enemy.active) {
        const angle = Phaser.Math.Angle.Between(
          enemy.x,
          enemy.y,
          this.player.x,
          this.player.y
        );
        const currentSpeed = this.baseEnemySpeed + (this.wave - 1) * 20;
        enemy.setVelocity(
          Math.cos(angle) * currentSpeed,
          Math.sin(angle) * currentSpeed
        );
      }
    });

    // 清理超出边界的子弹
    this.bullets.children.entries.forEach((bullet) => {
      if (bullet.active && (
        bullet.x < 0 || bullet.x > 800 ||
        bullet.y < 0 || bullet.y > 600
      )) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 检查波次是否完成
    if (this.isWaveActive && this.enemies.countActive(true) === 0) {
      this.isWaveActive = false;
      this.statusText.setText('Wave Complete!\nNext wave in 2s...');
      this.time.delayedCall(2000, () => {
        this.statusText.setText('');
        this.startNextWave();
      });
    }
  }

  startNextWave() {
    this.wave++;
    this.isWaveActive = true;
    this.enemiesInWave = 4 + this.wave; // 从5个开始（4+1）

    this.waveText.setText(`Wave: ${this.wave}`);
    this.statusText.setText(`Wave ${this.wave} Start!`);

    // 延迟清除开始文本
    this.time.delayedCall(1000, () => {
      if (this.isWaveActive) {
        this.statusText.setText('');
      }
    });

    // 生成敌人
    for (let i = 0; i < this.enemiesInWave; i++) {
      this.time.delayedCall(i * 500, () => {
        this.spawnEnemy();
      });
    }
  }

  spawnEnemy() {
    const x = Phaser.Math.Between(50, 750);
    const y = -30;

    let enemy = this.enemies.get(x, y, 'enemy');
    if (enemy) {
      enemy.setActive(true);
      enemy.setVisible(true);
      enemy.setPosition(x, y);
      enemy.body.enable = true;
    }
  }

  shootBullet(targetX, targetY) {
    const bullet = this.bullets.get(this.player.x, this.player.y, 'bullet');
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setPosition(this.player.x, this.player.y);
      bullet.body.enable = true;

      const angle = Phaser.Math.Angle.Between(
        this.player.x,
        this.player.y,
        targetX,
        targetY
      );

      const bulletSpeed = 500;
      bullet.setVelocity(
        Math.cos(angle) * bulletSpeed,
        Math.sin(angle) * bulletSpeed
      );
    }
  }

  hitEnemy(bullet, enemy) {
    // 销毁子弹
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.enable = false;

    // 销毁敌人
    enemy.setActive(false);
    enemy.setVisible(false);
    enemy.body.enable = false;

    // 增加击杀数
    this.killCount++;
    this.killText.setText(`Kills: ${this.killCount}`);
  }

  playerHit(player, enemy) {
    // 游戏结束
    this.physics.pause();
    this.isWaveActive = false;

    this.statusText.setText(
      `Game Over!\nWave: ${this.wave}\nKills: ${this.killCount}\nClick to Restart`
    );

    this.input.once('pointerdown', () => {
      this.scene.restart();
    });
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

new Phaser.Game(config);