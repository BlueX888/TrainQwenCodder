class EndlessWaveScene extends Phaser.Scene {
  constructor() {
    super('EndlessWaveScene');
    this.wave = 1;
    this.kills = 0;
    this.enemiesInWave = 0;
    this.enemiesKilled = 0;
    this.baseEnemySpeed = 300;
    this.speedIncrement = 50;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillTriangle(0, -20, -15, 20, 15, 20);
    playerGraphics.generateTexture('player', 30, 40);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillTriangle(0, 20, -15, -20, 15, -20);
    enemyGraphics.generateTexture('enemy', 30, 40);
    enemyGraphics.destroy();

    // 创建子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(0, 0, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
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

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastFireTime = 0;
    this.fireRate = 200;

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
      fill: '#ffff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.gameActive = true;

    // 开始第一波
    this.startWave();
  }

  update(time, delta) {
    if (!this.gameActive) return;

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
    if (this.spaceKey.isDown && time > this.lastFireTime + this.fireRate) {
      this.fire();
      this.lastFireTime = time;
    }

    // 移除超出边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < 0) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 移除超出边界的敌人
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active && enemy.y > 600) {
        enemy.setActive(false);
        enemy.setVisible(false);
      }
    });

    // 检查波次是否完成
    if (this.enemiesKilled >= this.enemiesInWave && this.enemies.countActive() === 0) {
      this.wave++;
      this.waveText.setText('Wave: ' + this.wave);
      this.showWaveStart();
      
      this.time.delayedCall(2000, () => {
        this.startWave();
      });
    }
  }

  startWave() {
    this.enemiesInWave = 3 + (this.wave - 1);
    this.enemiesKilled = 0;
    
    const enemySpeed = this.baseEnemySpeed + (this.wave - 1) * this.speedIncrement;
    const spawnDelay = 1000;

    // 分批生成敌人
    for (let i = 0; i < this.enemiesInWave; i++) {
      this.time.delayedCall(i * spawnDelay, () => {
        this.spawnEnemy(enemySpeed);
      });
    }
  }

  spawnEnemy(speed) {
    const x = Phaser.Math.Between(50, 750);
    const y = -50;

    let enemy = this.enemies.get(x, y, 'enemy');
    
    if (enemy) {
      enemy.setActive(true);
      enemy.setVisible(true);
      enemy.setVelocityY(speed);
      enemy.body.setSize(30, 40);
    }
  }

  fire() {
    let bullet = this.bullets.get(this.player.x, this.player.y - 20, 'bullet');
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-500);
      bullet.body.setSize(8, 8);
    }
  }

  hitEnemy(bullet, enemy) {
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.setVelocity(0);

    enemy.setActive(false);
    enemy.setVisible(false);
    enemy.setVelocity(0);

    this.kills++;
    this.enemiesKilled++;
    this.killsText.setText('Kills: ' + this.kills);
  }

  gameOver(player, enemy) {
    this.gameActive = false;
    this.physics.pause();
    
    this.statusText.setText('GAME OVER\nWave: ' + this.wave + '\nKills: ' + this.kills);
    
    player.setTint(0xff0000);
  }

  showWaveStart() {
    this.statusText.setText('Wave ' + this.wave + ' Complete!\nNext Wave Starting...');
    
    this.time.delayedCall(1500, () => {
      this.statusText.setText('');
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