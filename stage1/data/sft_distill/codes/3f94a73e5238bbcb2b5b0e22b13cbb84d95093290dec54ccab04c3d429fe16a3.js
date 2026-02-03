class EndlessWaveScene extends Phaser.Scene {
  constructor() {
    super('EndlessWaveScene');
    this.currentWave = 0;
    this.killCount = 0;
    this.baseEnemyCount = 10;
    this.baseEnemySpeed = 80;
    this.enemiesRemaining = 0;
    this.isWaveActive = false;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(12, 12, 12);
    enemyGraphics.generateTexture('enemy', 24, 24);
    enemyGraphics.destroy();

    // 创建子弹纹理
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

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 射击冷却
    this.canFire = true;
    this.fireRate = 300;

    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.playerHit, null, this);

    // UI 文本
    this.waveText = this.add.text(16, 16, 'Wave: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.killText = this.add.text(16, 48, 'Kills: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.enemyCountText = this.add.text(16, 80, 'Enemies: 0', {
      fontSize: '24px',
      fill: '#ffffff',
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
    if (!this.player.active) return;

    // 玩家移动
    const speed = 200;
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
    if (this.fireKey.isDown && this.canFire) {
      this.fireBullet();
      this.canFire = false;
      this.time.delayedCall(this.fireRate, () => {
        this.canFire = true;
      });
    }

    // 更新子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < 0) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 更新敌人
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active && enemy.y > 600) {
        enemy.setActive(false);
        enemy.setVisible(false);
        this.enemiesRemaining--;
        this.updateUI();
      }
    });

    // 检查波次是否完成
    if (this.isWaveActive && this.enemiesRemaining <= 0) {
      this.isWaveActive = false;
      this.showWaveComplete();
    }
  }

  startNextWave() {
    this.currentWave++;
    this.isWaveActive = true;
    
    const enemyCount = this.baseEnemyCount + (this.currentWave - 1);
    const enemySpeed = this.baseEnemySpeed + (this.currentWave - 1) * 5;
    
    this.enemiesRemaining = enemyCount;
    this.updateUI();

    this.statusText.setText(`Wave ${this.currentWave} Starting!`);
    this.statusText.setVisible(true);

    this.time.delayedCall(1500, () => {
      this.statusText.setVisible(false);
      this.spawnWave(enemyCount, enemySpeed);
    });
  }

  spawnWave(count, speed) {
    const spawnDelay = 500;
    
    for (let i = 0; i < count; i++) {
      this.time.delayedCall(i * spawnDelay, () => {
        this.spawnEnemy(speed);
      });
    }
  }

  spawnEnemy(speed) {
    const x = Phaser.Math.Between(50, 750);
    const y = -30;

    let enemy = this.enemies.get(x, y, 'enemy');
    
    if (enemy) {
      enemy.setActive(true);
      enemy.setVisible(true);
      enemy.setVelocityY(speed);
      enemy.setVelocityX(Phaser.Math.Between(-30, 30));
      
      // 添加左右移动
      this.tweens.add({
        targets: enemy,
        x: enemy.x + Phaser.Math.Between(-100, 100),
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  fireBullet() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 20, 'bullet');
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
    }
  }

  hitEnemy(bullet, enemy) {
    bullet.setActive(false);
    bullet.setVisible(false);
    
    enemy.setActive(false);
    enemy.setVisible(false);
    
    this.killCount++;
    this.enemiesRemaining--;
    this.updateUI();

    // 击中特效
    const flash = this.add.graphics();
    flash.fillStyle(0xffffff, 0.8);
    flash.fillCircle(enemy.x, enemy.y, 20);
    this.time.delayedCall(100, () => {
      flash.destroy();
    });
  }

  playerHit(player, enemy) {
    // 简化处理：敌人消失
    enemy.setActive(false);
    enemy.setVisible(false);
    this.enemiesRemaining--;
    this.updateUI();

    // 玩家闪烁效果
    this.tweens.add({
      targets: player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 2
    });
  }

  updateUI() {
    this.waveText.setText(`Wave: ${this.currentWave}`);
    this.killText.setText(`Kills: ${this.killCount}`);
    this.enemyCountText.setText(`Enemies: ${this.enemiesRemaining}`);
  }

  showWaveComplete() {
    this.statusText.setText(`Wave ${this.currentWave} Complete!`);
    this.statusText.setVisible(true);

    this.time.delayedCall(2000, () => {
      this.statusText.setVisible(false);
      this.startNextWave();
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

// 暴露状态用于验证
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    currentWave: scene.currentWave,
    killCount: scene.killCount,
    enemiesRemaining: scene.enemiesRemaining,
    isWaveActive: scene.isWaveActive
  };
};