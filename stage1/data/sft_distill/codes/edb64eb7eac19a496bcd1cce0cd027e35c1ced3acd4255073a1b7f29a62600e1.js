class EndlessWaveScene extends Phaser.Scene {
  constructor() {
    super('EndlessWaveScene');
    this.wave = 0;
    this.kills = 0;
    this.baseEnemyCount = 8;
    this.baseEnemySpeed = 300;
    this.isGameOver = false;
  }

  preload() {
    // 创建纹理
    this.createTextures();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 30
    });

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 输入控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastFireTime = 0;
    this.fireDelay = 200;

    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.bulletHitEnemy, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.playerHitEnemy, null, this);

    // UI文本
    this.waveText = this.add.text(16, 16, 'Wave: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    });

    this.killsText = this.add.text(16, 48, 'Kills: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    });

    this.gameOverText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ff0000',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setVisible(false);

    // 开始第一波
    this.startNextWave();
  }

  createTextures() {
    // 玩家纹理 (绿色三角形)
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillTriangle(16, 0, 0, 32, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 子弹纹理 (黄色圆形)
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();

    // 敌人纹理 (红色矩形)
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 30, 30);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();
  }

  startNextWave() {
    if (this.isGameOver) return;

    this.wave++;
    this.waveText.setText(`Wave: ${this.wave}`);

    // 计算本波敌人数量和速度
    const enemyCount = this.baseEnemyCount + (this.wave - 1);
    const enemySpeed = this.baseEnemySpeed + (this.wave - 1) * 20;

    // 生成敌人
    const rows = Math.ceil(enemyCount / 8);
    const cols = Math.min(enemyCount, 8);
    const startX = 400 - (cols * 50) / 2;
    const startY = 50;

    for (let i = 0; i < enemyCount; i++) {
      const row = Math.floor(i / 8);
      const col = i % 8;
      const x = startX + col * 50;
      const y = startY + row * 40;

      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setVelocityY(enemySpeed);
      enemy.setData('speed', enemySpeed);
    }
  }

  update(time, delta) {
    if (this.isGameOver) return;

    // 玩家移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-300);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(300);
    } else {
      this.player.setVelocityY(0);
    }

    // 射击
    if (this.spaceKey.isDown && time > this.lastFireTime + this.fireDelay) {
      this.fireBullet();
      this.lastFireTime = time;
    }

    // 清理超出边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < 0) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 检查敌人是否超出底部边界
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active && enemy.y > 600) {
        this.gameOver();
      }
    });

    // 检查是否所有敌人被击杀
    if (this.enemies.countActive(true) === 0 && !this.isWaveTransition) {
      this.isWaveTransition = true;
      this.time.delayedCall(2000, () => {
        this.isWaveTransition = false;
        this.startNextWave();
      });
    }
  }

  fireBullet() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-500);
    }
  }

  bulletHitEnemy(bullet, enemy) {
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.setVelocity(0, 0);

    enemy.destroy();

    this.kills++;
    this.killsText.setText(`Kills: ${this.kills}`);
  }

  playerHitEnemy(player, enemy) {
    this.gameOver();
  }

  gameOver() {
    if (this.isGameOver) return;

    this.isGameOver = true;
    this.physics.pause();

    this.gameOverText.setText(`Game Over!\nWave: ${this.wave}\nKills: ${this.kills}`);
    this.gameOverText.setVisible(true);

    // 3秒后重启游戏
    this.time.delayedCall(3000, () => {
      this.scene.restart();
      this.wave = 0;
      this.kills = 0;
      this.isGameOver = false;
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
  scene: EndlessWaveScene
};

const game = new Phaser.Game(config);

// 可验证的状态信号
game.events.on('ready', () => {
  const scene = game.scene.scenes[0];
  console.log('Game State:', {
    wave: scene.wave,
    kills: scene.kills,
    isGameOver: scene.isGameOver
  });
});