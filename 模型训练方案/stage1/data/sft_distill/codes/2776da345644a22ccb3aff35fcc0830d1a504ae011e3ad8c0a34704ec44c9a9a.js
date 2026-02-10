class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentWave = 1;
    this.enemiesInWave = 12;
    this.enemySpeed = 360;
    this.waveDelay = 2000;
    this.isWaveActive = false;
    this.totalEnemiesKilled = 0;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（青色）
    const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    enemyGraphics.fillStyle(0x00ffff, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建子弹纹理
    const bulletGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillRect(0, 0, 8, 16);
    bulletGraphics.generateTexture('bullet', 8, 16);
    bulletGraphics.destroy();
  }

  create() {
    // 初始化玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20
    });

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 碰撞检测：子弹击中敌人
    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    // 碰撞检测：敌人碰到玩家
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.hitPlayer,
      null,
      this
    );

    // 键盘输入
    this.cursors = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE
    });

    // 射击冷却
    this.canShoot = true;
    this.shootCooldown = 200;

    // UI文本
    this.waveText = this.add.text(16, 16, `Wave: ${this.currentWave}`, {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.enemiesText = this.add.text(16, 48, 'Enemies: 0/12', {
      fontSize: '20px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.statusText = this.add.text(16, 80, '', {
      fontSize: '20px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    });

    this.killCountText = this.add.text(16, 112, 'Total Kills: 0', {
      fontSize: '20px',
      fill: '#00ff00',
      fontFamily: 'Arial'
    });

    // 开始第一波
    this.startWave();
  }

  startWave() {
    this.isWaveActive = true;
    this.statusText.setText('');
    
    // 生成12个敌人
    for (let i = 0; i < this.enemiesInWave; i++) {
      this.time.delayedCall(i * 300, () => {
        this.spawnEnemy();
      });
    }

    this.updateUI();
  }

  spawnEnemy() {
    // 随机生成位置（屏幕上方）
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(-50, -20);
    
    const enemy = this.enemies.create(x, y, 'enemy');
    enemy.setVelocity(
      Phaser.Math.Between(-100, 100),
      this.enemySpeed
    );
    
    // 设置边界行为
    enemy.setCollideWorldBounds(false);
    
    // 超出屏幕底部时销毁
    enemy.setData('outOfBounds', false);
  }

  hitEnemy(bullet, enemy) {
    bullet.destroy();
    enemy.destroy();
    this.totalEnemiesKilled++;
    
    this.updateUI();
    
    // 检查是否消灭完所有敌人
    if (this.enemies.countActive(true) === 0 && this.isWaveActive) {
      this.isWaveActive = false;
      this.onWaveComplete();
    }
  }

  hitPlayer(player, enemy) {
    enemy.destroy();
    // 可以在这里添加玩家受伤逻辑
    this.updateUI();
  }

  onWaveComplete() {
    this.statusText.setText('Wave Complete! Next wave in 2s...');
    
    // 2秒后开始下一波
    this.time.delayedCall(this.waveDelay, () => {
      this.currentWave++;
      this.startWave();
    });
  }

  shoot() {
    if (!this.canShoot) return;

    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-600);
      
      this.canShoot = false;
      this.time.delayedCall(this.shootCooldown, () => {
        this.canShoot = true;
      });
    }
  }

  updateUI() {
    const activeEnemies = this.enemies.countActive(true);
    const killedInWave = this.enemiesInWave - activeEnemies;
    
    this.waveText.setText(`Wave: ${this.currentWave}`);
    this.enemiesText.setText(`Enemies: ${killedInWave}/${this.enemiesInWave}`);
    this.killCountText.setText(`Total Kills: ${this.totalEnemiesKilled}`);
  }

  update(time, delta) {
    // 玩家移动
    const speed = 300;
    
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    } else {
      this.player.setVelocityY(0);
    }

    // 射击
    if (Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
      this.shoot();
    }

    // 清理超出屏幕的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < -20) {
        bullet.destroy();
      }
    });

    // 清理超出屏幕的敌人
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active && enemy.y > 620) {
        enemy.destroy();
        this.updateUI();
        
        // 检查波次是否完成
        if (this.enemies.countActive(true) === 0 && this.isWaveActive) {
          this.isWaveActive = false;
          this.onWaveComplete();
        }
      }
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