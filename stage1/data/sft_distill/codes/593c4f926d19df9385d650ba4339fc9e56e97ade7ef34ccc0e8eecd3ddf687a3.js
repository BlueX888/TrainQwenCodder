class EndlessWaveScene extends Phaser.Scene {
  constructor() {
    super('EndlessWaveScene');
    this.wave = 1;
    this.kills = 0;
    this.enemiesInWave = 0;
    this.baseEnemySpeed = 360;
    this.isSpawning = false;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(0, -20);
    playerGraphics.lineTo(-15, 20);
    playerGraphics.lineTo(15, 20);
    playerGraphics.closePath();
    playerGraphics.fill();
    playerGraphics.generateTexture('player', 30, 40);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(-15, -15, 30, 30);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建子弹纹理
    const bulletGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(0, 0, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group({
      defaultKey: 'enemy',
      maxSize: 50
    });

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastFired = 0;

    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.gameOver, null, this);

    // UI 文本
    this.waveText = this.add.text(16, 16, 'Wave: 1', {
      fontSize: '24px',
      fill: '#fff',
      fontFamily: 'Arial'
    });

    this.killsText = this.add.text(16, 48, 'Kills: 0', {
      fontSize: '24px',
      fill: '#fff',
      fontFamily: 'Arial'
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#0f0',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 开始第一波
    this.spawnWave();
  }

  update(time, delta) {
    if (!this.player.active) return;

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

    // 射击
    if (this.spaceKey.isDown && time > this.lastFired + 200) {
      this.shootBullet();
      this.lastFired = time;
    }

    // 清理超出边界的子弹
    this.bullets.getChildren().forEach(bullet => {
      if (bullet.active && bullet.y < -10) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 清理超出边界的敌人
    this.enemies.getChildren().forEach(enemy => {
      if (enemy.active && enemy.y > 610) {
        enemy.setActive(false);
        enemy.setVisible(false);
        this.enemiesInWave--;
      }
    });

    // 检查是否所有敌人都被消灭
    if (!this.isSpawning && this.enemiesInWave === 0 && this.enemies.countActive(true) === 0) {
      this.nextWave();
    }
  }

  shootBullet() {
    let bullet = this.bullets.getFirstDead(false);
    
    if (!bullet) {
      bullet = this.bullets.create(this.player.x, this.player.y - 20, 'bullet');
    } else {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setPosition(this.player.x, this.player.y - 20);
    }

    bullet.setVelocityY(-500);
  }

  spawnWave() {
    this.isSpawning = true;
    const enemyCount = 3 + (this.wave - 1);
    const enemySpeed = this.baseEnemySpeed + (this.wave - 1) * 20;
    this.enemiesInWave = enemyCount;

    this.statusText.setText(`Wave ${this.wave} Starting!`);
    this.statusText.setAlpha(1);
    
    this.tweens.add({
      targets: this.statusText,
      alpha: 0,
      duration: 2000,
      ease: 'Power2'
    });

    // 延迟生成敌人
    let spawnDelay = 0;
    for (let i = 0; i < enemyCount; i++) {
      this.time.delayedCall(spawnDelay, () => {
        this.spawnEnemy(enemySpeed);
      });
      spawnDelay += 500;
    }

    this.time.delayedCall(spawnDelay + 100, () => {
      this.isSpawning = false;
    });
  }

  spawnEnemy(speed) {
    const x = Phaser.Math.Between(50, 750);
    const y = -30;

    let enemy = this.enemies.getFirstDead(false);
    
    if (!enemy) {
      enemy = this.enemies.create(x, y, 'enemy');
    } else {
      enemy.setActive(true);
      enemy.setVisible(true);
      enemy.setPosition(x, y);
    }

    // 设置敌人向下移动，带有轻微的左右摆动
    const horizontalSpeed = Phaser.Math.Between(-50, 50);
    enemy.setVelocity(horizontalSpeed, speed);
    
    // 添加边界反弹
    enemy.setBounce(1, 0);
    enemy.setCollideWorldBounds(true);
  }

  hitEnemy(bullet, enemy) {
    bullet.setActive(false);
    bullet.setVisible(false);
    enemy.setActive(false);
    enemy.setVisible(false);

    this.kills++;
    this.enemiesInWave--;
    this.killsText.setText(`Kills: ${this.kills}`);

    // 创建爆炸效果
    const explosion = this.add.graphics();
    explosion.fillStyle(0xff6600, 1);
    explosion.fillCircle(enemy.x, enemy.y, 15);
    
    this.tweens.add({
      targets: explosion,
      alpha: 0,
      scaleX: 2,
      scaleY: 2,
      duration: 300,
      onComplete: () => explosion.destroy()
    });
  }

  nextWave() {
    this.wave++;
    this.waveText.setText(`Wave: ${this.wave}`);
    
    this.statusText.setText(`Wave ${this.wave - 1} Complete!`);
    this.statusText.setAlpha(1);
    
    this.tweens.add({
      targets: this.statusText,
      alpha: 0,
      duration: 1500,
      ease: 'Power2'
    });

    // 延迟后开始下一波
    this.time.delayedCall(2000, () => {
      this.spawnWave();
    });
  }

  gameOver(player, enemy) {
    this.physics.pause();
    player.setTint(0xff0000);
    
    this.statusText.setText(`GAME OVER\nWave: ${this.wave}\nKills: ${this.kills}`);
    this.statusText.setAlpha(1);
    this.statusText.setFill('#f00');

    // 3秒后重启
    this.time.delayedCall(3000, () => {
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
  scene: EndlessWaveScene
};

new Phaser.Game(config);