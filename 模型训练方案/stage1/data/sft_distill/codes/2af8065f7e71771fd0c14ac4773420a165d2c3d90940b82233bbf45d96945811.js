class EndlessWaveScene extends Phaser.Scene {
  constructor() {
    super('EndlessWaveScene');
    
    // 游戏状态变量（可验证）
    this.currentWave = 1;
    this.killCount = 0;
    this.enemiesInWave = 0;
    this.enemiesAlive = 0;
    this.isGameOver = false;
    this.waveInProgress = false;
    
    // 固定随机种子以保证确定性
    this.rng = null;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 30, 30);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(5, 5, 5);
    bulletGraphics.generateTexture('bullet', 10, 10);
    bulletGraphics.destroy();
  }

  create() {
    // 初始化随机数生成器（固定种子）
    this.rng = new Phaser.Math.RandomDataGenerator(['ENDLESS_WAVE_2024']);

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50
    });

    // 创建敌人组
    this.enemies = this.physics.add.group({
      defaultKey: 'enemy'
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 射击冷却
    this.canShoot = true;
    this.shootCooldown = 250;

    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.hitPlayer, null, this);

    // UI 文本
    this.waveText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff',
      fontStyle: 'bold'
    });

    this.killText = this.add.text(16, 48, '', {
      fontSize: '24px',
      fill: '#ffffff',
      fontStyle: 'bold'
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 游戏结束文本
    this.gameOverText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    // 开始第一波
    this.startWave();
  }

  update(time, delta) {
    if (this.isGameOver) {
      return;
    }

    // 更新 UI
    this.waveText.setText(`Wave: ${this.currentWave}`);
    this.killText.setText(`Kills: ${this.killCount}`);

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
    if (this.spaceKey.isDown && this.canShoot) {
      this.shoot();
    }

    // 清理超出边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && (bullet.y < -10 || bullet.y > 610 || bullet.x < -10 || bullet.x > 810)) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 检查波次是否完成
    if (this.waveInProgress && this.enemiesAlive === 0) {
      this.waveInProgress = false;
      this.statusText.setText('Wave Complete! Next wave in 2s...');
      this.time.delayedCall(2000, () => {
        this.statusText.setText('');
        this.currentWave++;
        this.startWave();
      });
    }
  }

  startWave() {
    this.waveInProgress = true;
    
    // 计算本波敌人数量：15 + (波次 - 1)
    this.enemiesInWave = 15 + (this.currentWave - 1);
    this.enemiesAlive = this.enemiesInWave;

    // 计算敌人速度：300 + 波次 * 20
    const enemySpeed = 300 + this.currentWave * 20;

    this.statusText.setText(`Wave ${this.currentWave} Starting!`);
    
    // 延迟后隐藏提示
    this.time.delayedCall(1000, () => {
      this.statusText.setText('');
    });

    // 分批生成敌人（避免一次性生成太多）
    const spawnInterval = 200;
    let spawnedCount = 0;

    const spawnTimer = this.time.addEvent({
      delay: spawnInterval,
      callback: () => {
        if (spawnedCount < this.enemiesInWave) {
          this.spawnEnemy(enemySpeed);
          spawnedCount++;
        } else {
          spawnTimer.remove();
        }
      },
      loop: true
    });
  }

  spawnEnemy(speed) {
    // 随机生成位置（从屏幕顶部）
    const x = this.rng.between(50, 750);
    const y = -30;

    const enemy = this.enemies.create(x, y, 'enemy');
    enemy.setActive(true);
    enemy.setVisible(true);

    // 敌人向下移动，并带有随机横向移动
    const horizontalSpeed = this.rng.between(-100, 100);
    enemy.setVelocity(horizontalSpeed, speed);

    // 设置边界反弹（横向）
    enemy.setBounce(1, 0);
    enemy.setCollideWorldBounds(true);
  }

  shoot() {
    this.canShoot = false;

    // 从对象池获取子弹
    const bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-500);
    }

    // 射击冷却
    this.time.delayedCall(this.shootCooldown, () => {
      this.canShoot = true;
    });
  }

  hitEnemy(bullet, enemy) {
    // 子弹和敌人都销毁
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.setVelocity(0);

    enemy.destroy();
    
    // 更新统计
    this.killCount++;
    this.enemiesAlive--;

    // 添加击杀特效（简单的闪烁文字）
    const hitText = this.add.text(enemy.x, enemy.y, '+1', {
      fontSize: '20px',
      fill: '#ffff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: hitText,
      y: enemy.y - 50,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        hitText.destroy();
      }
    });
  }

  hitPlayer(player, enemy) {
    if (this.isGameOver) return;

    this.isGameOver = true;
    this.waveInProgress = false;

    // 停止所有敌人和子弹
    this.enemies.children.entries.forEach(e => {
      if (e.active) e.setVelocity(0);
    });
    this.bullets.children.entries.forEach(b => {
      if (b.active) b.setVelocity(0);
    });

    this.player.setTint(0xff0000);
    this.player.setVelocity(0);

    // 显示游戏结束
    this.gameOverText.setText(`GAME OVER\nWave: ${this.currentWave}\nKills: ${this.killCount}`);
    this.gameOverText.setVisible(true);

    // 输出最终状态到控制台（便于验证）
    console.log('=== GAME OVER ===');
    console.log('Final Wave:', this.currentWave);
    console.log('Total Kills:', this.killCount);
    console.log('==================');
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