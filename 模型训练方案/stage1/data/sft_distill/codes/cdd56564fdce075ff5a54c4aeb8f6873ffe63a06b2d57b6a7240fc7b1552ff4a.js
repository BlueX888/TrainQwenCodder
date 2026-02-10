class EndlessWaveScene extends Phaser.Scene {
  constructor() {
    super('EndlessWaveScene');
    this.wave = 0;
    this.kills = 0;
    this.health = 10;
    this.enemiesInWave = 0;
    this.enemiesKilled = 0;
    this.isSpawning = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(15, 15, 15);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillRect(0, 0, 5, 10);
    bulletGraphics.generateTexture('bullet', 5, 10);
    bulletGraphics.destroy();

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
      maxSize: 30
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastShootTime = 0;

    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.hitPlayer, null, this);

    // UI 文本
    this.waveText = this.add.text(16, 16, 'Wave: 0', {
      fontSize: '24px',
      fill: '#fff',
      fontFamily: 'Arial'
    });

    this.killsText = this.add.text(16, 48, 'Kills: 0', {
      fontSize: '24px',
      fill: '#fff',
      fontFamily: 'Arial'
    });

    this.healthText = this.add.text(16, 80, 'Health: 10', {
      fontSize: '24px',
      fill: '#fff',
      fontFamily: 'Arial'
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 开始第一波
    this.startNextWave();
  }

  update(time, delta) {
    if (this.health <= 0) {
      return;
    }

    // 玩家移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300);
    } else {
      this.player.setVelocityX(0);
    }

    // 射击
    if (this.spaceKey.isDown && time > this.lastShootTime + 200) {
      this.shoot();
      this.lastShootTime = time;
    }

    // 检查敌人是否到达底部
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active && enemy.y > 600) {
        this.enemyReachedBottom(enemy);
      }
    });

    // 检查波次是否完成
    if (!this.isSpawning && this.enemies.countActive(true) === 0 && this.enemiesKilled >= this.enemiesInWave) {
      this.time.delayedCall(2000, () => {
        this.startNextWave();
      });
    }
  }

  startNextWave() {
    this.wave++;
    this.enemiesInWave = 3 + (this.wave - 1);
    this.enemiesKilled = 0;
    this.isSpawning = true;

    this.waveText.setText(`Wave: ${this.wave}`);
    this.statusText.setText(`Wave ${this.wave} Starting!`);
    
    this.time.delayedCall(1500, () => {
      this.statusText.setText('');
    });

    // 计算敌人速度
    const enemySpeed = 80 + (this.wave - 1) * 10;

    // 生成敌人
    let spawnCount = 0;
    const spawnInterval = this.time.addEvent({
      delay: 800,
      callback: () => {
        if (spawnCount < this.enemiesInWave) {
          this.spawnEnemy(enemySpeed);
          spawnCount++;
        } else {
          spawnInterval.remove();
          this.isSpawning = false;
        }
      },
      loop: true
    });
  }

  spawnEnemy(speed) {
    const x = Phaser.Math.Between(50, 750);
    const enemy = this.enemies.get(x, -30, 'enemy');
    
    if (enemy) {
      enemy.setActive(true);
      enemy.setVisible(true);
      enemy.setVelocityY(speed);
      enemy.body.enable = true;
    }
  }

  shoot() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 20, 'bullet');
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
      bullet.body.enable = true;
    }
  }

  hitEnemy(bullet, enemy) {
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.enable = false;

    enemy.setActive(false);
    enemy.setVisible(false);
    enemy.body.enable = false;

    this.kills++;
    this.enemiesKilled++;
    this.killsText.setText(`Kills: ${this.kills}`);

    // 验证状态信号
    console.log(`[STATE] Wave: ${this.wave}, Kills: ${this.kills}, Health: ${this.health}`);
  }

  hitPlayer(player, enemy) {
    enemy.setActive(false);
    enemy.setVisible(false);
    enemy.body.enable = false;

    this.health--;
    this.healthText.setText(`Health: ${this.health}`);

    if (this.health <= 0) {
      this.gameOver();
    }
  }

  enemyReachedBottom(enemy) {
    enemy.setActive(false);
    enemy.setVisible(false);
    enemy.body.enable = false;

    this.health--;
    this.healthText.setText(`Health: ${this.health}`);
    this.enemiesKilled++; // 计入波次完成条件

    if (this.health <= 0) {
      this.gameOver();
    }
  }

  gameOver() {
    this.physics.pause();
    this.player.setTint(0xff0000);
    
    this.statusText.setText(`GAME OVER!\nWave: ${this.wave}\nTotal Kills: ${this.kills}`);
    this.statusText.setFontSize('48px');

    // 最终状态信号
    console.log(`[FINAL STATE] Wave Reached: ${this.wave}, Total Kills: ${this.kills}, Health: ${this.health}`);
    
    // 重启游戏
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