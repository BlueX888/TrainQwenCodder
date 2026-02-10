class EndlessWaveScene extends Phaser.Scene {
  constructor() {
    super('EndlessWaveScene');
    
    // 游戏状态
    this.currentWave = 1;
    this.killCount = 0;
    this.baseEnemyCount = 15;
    this.baseEnemySpeed = 160;
    this.enemiesRemaining = 0;
    this.waveInProgress = false;
    
    // 玩家状态
    this.playerSpeed = 300;
    this.bulletSpeed = 400;
    this.fireRate = 250;
    this.nextFire = 0;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
    this.createTextures();
  }

  create() {
    // 创建纹理
    this.createGameTextures();
    
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);
    
    // 创建物理组
    this.enemies = this.physics.add.group();
    this.bullets = this.physics.add.group();
    
    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
    
    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // UI 文本
    this.waveText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });
    
    this.killText = this.add.text(16, 48, '', {
      fontSize: '20px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    });
    
    this.remainingText = this.add.text(16, 76, '', {
      fontSize: '20px',
      fill: '#ff8800',
      fontFamily: 'Arial'
    });
    
    this.instructionText = this.add.text(400, 300, 'Press SPACE to Start Wave 1', {
      fontSize: '32px',
      fill: '#00ff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // 更新UI
    this.updateUI();
    
    // 监听空格键开始波次
    this.spaceKey.on('down', () => {
      if (!this.waveInProgress && this.enemiesRemaining === 0) {
        this.startWave();
      }
    });
  }

  createTextures() {
    // 此方法在 preload 中调用但实际纹理创建在 create 中
  }

  createGameTextures() {
    // 创建玩家纹理（蓝色三角形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(0, -20);
    playerGraphics.lineTo(-15, 20);
    playerGraphics.lineTo(15, 20);
    playerGraphics.closePath();
    playerGraphics.fillPath();
    playerGraphics.generateTexture('player', 30, 40);
    playerGraphics.destroy();
    
    // 创建敌人纹理（红色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(15, 15, 15);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();
    
    // 创建子弹纹理（黄色小圆）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();
  }

  startWave() {
    this.waveInProgress = true;
    this.instructionText.setVisible(false);
    
    // 计算当前波次的敌人数量和速度
    const enemyCount = this.baseEnemyCount + (this.currentWave - 1);
    const enemySpeed = this.baseEnemySpeed + (this.currentWave - 1) * 10;
    
    this.enemiesRemaining = enemyCount;
    
    // 生成敌人
    for (let i = 0; i < enemyCount; i++) {
      this.time.delayedCall(i * 300, () => {
        this.spawnEnemy(enemySpeed);
      });
    }
    
    this.updateUI();
  }

  spawnEnemy(speed) {
    // 随机生成位置（从顶部随机X位置）
    const x = Phaser.Math.Between(50, 750);
    const enemy = this.enemies.create(x, -30, 'enemy');
    
    if (enemy) {
      enemy.setVelocityY(speed);
      
      // 添加轻微的水平移动
      const horizontalSpeed = Phaser.Math.Between(-50, 50);
      enemy.setVelocityX(horizontalSpeed);
      
      // 敌人离开屏幕底部时销毁
      enemy.setData('speed', speed);
    }
  }

  fireBullet() {
    const currentTime = this.time.now;
    
    if (currentTime > this.nextFire) {
      const bullet = this.bullets.create(this.player.x, this.player.y - 20, 'bullet');
      
      if (bullet) {
        bullet.setVelocityY(-this.bulletSpeed);
        this.nextFire = currentTime + this.fireRate;
      }
    }
  }

  hitEnemy(bullet, enemy) {
    // 销毁子弹和敌人
    bullet.destroy();
    enemy.destroy();
    
    // 更新击杀数和剩余敌人
    this.killCount++;
    this.enemiesRemaining--;
    
    this.updateUI();
    
    // 检查波次是否完成
    if (this.enemiesRemaining === 0 && this.waveInProgress) {
      this.completeWave();
    }
  }

  completeWave() {
    this.waveInProgress = false;
    this.currentWave++;
    
    // 显示下一波提示
    this.instructionText.setText(`Wave ${this.currentWave - 1} Complete!\nPress SPACE for Wave ${this.currentWave}`);
    this.instructionText.setVisible(true);
    
    this.updateUI();
  }

  updateUI() {
    this.waveText.setText(`Wave: ${this.currentWave}`);
    this.killText.setText(`Total Kills: ${this.killCount}`);
    this.remainingText.setText(`Enemies Remaining: ${this.enemiesRemaining}`);
  }

  update(time, delta) {
    // 玩家移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-this.playerSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(this.playerSpeed);
    } else {
      this.player.setVelocityX(0);
    }
    
    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-this.playerSpeed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(this.playerSpeed);
    } else {
      this.player.setVelocityY(0);
    }
    
    // 射击
    if (this.spaceKey.isDown) {
      this.fireBullet();
    }
    
    // 清理离开屏幕的对象
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.y < -10) {
        bullet.destroy();
      }
    });
    
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.y > 610) {
        enemy.destroy();
        this.enemiesRemaining--;
        this.updateUI();
        
        // 检查波次完成
        if (this.enemiesRemaining === 0 && this.waveInProgress) {
          this.completeWave();
        }
      }
    });
  }
}

// 游戏配置
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

// 创建游戏实例
const game = new Phaser.Game(config);