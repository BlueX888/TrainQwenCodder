class EndlessWaveScene extends Phaser.Scene {
  constructor() {
    super('EndlessWaveScene');
    this.currentWave = 1;
    this.killCount = 0;
    this.enemiesRemaining = 0;
    this.isWaveActive = false;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillTriangle(0, -20, -15, 15, 15, 15);
    playerGraphics.generateTexture('player', 30, 35);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillTriangle(0, 15, -12, -12, 12, -12);
    enemyGraphics.generateTexture('enemy', 24, 27);
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

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 30
    });

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastFired = 0;

    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);

    // UI文本
    this.waveText = this.add.text(16, 16, 'Wave: 1', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.killText = this.add.text(16, 48, 'Kills: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.remainingText = this.add.text(16, 80, 'Remaining: 0', {
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
    this.startWave();
  }

  startWave() {
    this.isWaveActive = true;
    
    // 计算当前波次的敌人数量和速度
    const enemyCount = 10 + (this.currentWave - 1);
    const enemySpeed = 80 + (this.currentWave - 1) * 10;
    
    this.enemiesRemaining = enemyCount;
    this.updateUI();

    // 显示波次开始提示
    this.statusText.setText(`Wave ${this.currentWave} Start!`);
    this.time.delayedCall(2000, () => {
      this.statusText.setText('');
    });

    // 生成敌人（分批生成，避免一次性生成太多）
    let spawnedCount = 0;
    const spawnInterval = 500; // 每0.5秒生成一个敌人

    const spawnTimer = this.time.addEvent({
      delay: spawnInterval,
      callback: () => {
        if (spawnedCount < enemyCount) {
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
    // 随机X位置（使用确定性随机，基于当前时间和波次）
    const seed = this.currentWave * 1000 + this.enemiesRemaining;
    const x = 50 + (seed % 700);
    
    const enemy = this.enemies.create(x, -30, 'enemy');
    enemy.setVelocityY(speed);
    
    // 添加左右摇摆运动
    const swaySpeed = 50 + (seed % 50);
    const swayDirection = (seed % 2 === 0) ? 1 : -1;
    enemy.setVelocityX(swaySpeed * swayDirection);
    
    // 设置边界反弹
    enemy.setBounce(1, 0);
    enemy.setCollideWorldBounds(true);
  }

  hitEnemy(bullet, enemy) {
    // 销毁子弹和敌人
    bullet.destroy();
    enemy.destroy();
    
    // 更新统计
    this.killCount++;
    this.enemiesRemaining--;
    this.updateUI();

    // 检查是否完成当前波次
    if (this.enemiesRemaining === 0 && this.isWaveActive) {
      this.completeWave();
    }
  }

  completeWave() {
    this.isWaveActive = false;
    
    // 显示波次完成提示
    this.statusText.setText(`Wave ${this.currentWave} Complete!\nNext wave in 3...`);
    
    let countdown = 3;
    const countdownTimer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        countdown--;
        if (countdown > 0) {
          this.statusText.setText(`Wave ${this.currentWave} Complete!\nNext wave in ${countdown}...`);
        } else {
          this.statusText.setText('');
          this.currentWave++;
          this.startWave();
          countdownTimer.remove();
        }
      },
      loop: true
    });
  }

  updateUI() {
    this.waveText.setText(`Wave: ${this.currentWave}`);
    this.killText.setText(`Kills: ${this.killCount}`);
    this.remainingText.setText(`Remaining: ${this.enemiesRemaining}`);
  }

  fireBullet() {
    const time = this.time.now;
    
    // 射击冷却时间200ms
    if (time > this.lastFired + 200) {
      const bullet = this.bullets.get(this.player.x, this.player.y - 20);
      
      if (bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);
        bullet.setVelocityY(-400);
        this.lastFired = time;
      }
    }
  }

  update(time, delta) {
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

    // 发射子弹
    if (this.spaceKey.isDown) {
      this.fireBullet();
    }

    // 清理超出屏幕的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < -10) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 清理超出屏幕的敌人（飞出底部）
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active && enemy.y > 610) {
        enemy.destroy();
        this.enemiesRemaining--;
        this.updateUI();
        
        // 检查波次完成
        if (this.enemiesRemaining === 0 && this.isWaveActive) {
          this.completeWave();
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
  scene: EndlessWaveScene
};

new Phaser.Game(config);