class EndlessWaveScene extends Phaser.Scene {
  constructor() {
    super('EndlessWaveScene');
    
    // 游戏状态
    this.currentWave = 0;
    this.killCount = 0;
    this.baseEnemyCount = 15;
    this.baseEnemySpeed = 120;
    this.enemiesRemaining = 0;
    
    // 随机种子（可配置）
    this.seed = 12345;
  }

  preload() {
    // 无需外部资源
  }

  create() {
    // 创建纹理
    this.createTextures();
    
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);
    
    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 30
    });
    
    // 输入控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 射击冷却
    this.canShoot = true;
    this.shootCooldown = 200;
    
    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.gameOver, null, this);
    
    // UI 文本
    this.waveText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#fff',
      fontStyle: 'bold'
    });
    
    this.killText = this.add.text(16, 48, '', {
      fontSize: '20px',
      fill: '#0f0'
    });
    
    this.enemyCountText = this.add.text(16, 76, '', {
      fontSize: '20px',
      fill: '#ff0'
    });
    
    this.statusText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // 开始第一波
    this.startNextWave();
  }

  createTextures() {
    // 玩家纹理（蓝色三角形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00aaff, 1);
    playerGraphics.fillTriangle(16, 0, 0, 32, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();
    
    // 敌人纹理（红色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(12, 12, 12);
    enemyGraphics.generateTexture('enemy', 24, 24);
    enemyGraphics.destroy();
    
    // 子弹纹理（黄色小圆）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();
  }

  startNextWave() {
    this.currentWave++;
    
    // 计算本波敌人数量和速度
    const enemyCount = this.baseEnemyCount + (this.currentWave - 1);
    const enemySpeed = this.baseEnemySpeed + (this.currentWave - 1) * 5;
    
    this.enemiesRemaining = enemyCount;
    
    // 显示波次开始提示
    this.statusText.setText(`Wave ${this.currentWave} Start!`);
    this.statusText.setAlpha(1);
    
    this.tweens.add({
      targets: this.statusText,
      alpha: 0,
      duration: 2000,
      ease: 'Power2'
    });
    
    // 生成敌人
    this.spawnEnemies(enemyCount, enemySpeed);
    
    // 更新 UI
    this.updateUI();
  }

  spawnEnemies(count, speed) {
    // 使用确定性随机
    let rng = this.createSeededRandom(this.seed + this.currentWave);
    
    for (let i = 0; i < count; i++) {
      this.time.delayedCall(i * 500, () => {
        const x = rng() * 760 + 20; // 20-780
        const y = -30;
        
        const enemy = this.enemies.create(x, y, 'enemy');
        enemy.setVelocityY(speed);
        
        // 添加左右移动
        const moveDirection = (rng() > 0.5 ? 1 : -1);
        enemy.setVelocityX(moveDirection * (speed * 0.3));
        
        // 边界反弹
        enemy.setBounce(1, 0);
        enemy.setCollideWorldBounds(true);
      });
    }
  }

  hitEnemy(bullet, enemy) {
    bullet.destroy();
    enemy.destroy();
    
    this.killCount++;
    this.enemiesRemaining--;
    
    // 创建爆炸效果
    const explosion = this.add.graphics();
    explosion.fillStyle(0xff8800, 1);
    explosion.fillCircle(enemy.x, enemy.y, 20);
    
    this.tweens.add({
      targets: explosion,
      alpha: 0,
      scaleX: 2,
      scaleY: 2,
      duration: 300,
      onComplete: () => explosion.destroy()
    });
    
    this.updateUI();
    
    // 检查是否完成本波
    if (this.enemiesRemaining <= 0) {
      this.time.delayedCall(2000, () => {
        this.startNextWave();
      });
    }
  }

  gameOver(player, enemy) {
    this.physics.pause();
    this.statusText.setText('GAME OVER!');
    this.statusText.setAlpha(1);
    this.statusText.setStyle({ fill: '#f00' });
    
    // 3秒后重启
    this.time.delayedCall(3000, () => {
      this.scene.restart();
    });
  }

  updateUI() {
    this.waveText.setText(`Wave: ${this.currentWave}`);
    this.killText.setText(`Kills: ${this.killCount}`);
    this.enemyCountText.setText(`Enemies: ${this.enemiesRemaining}`);
  }

  shoot() {
    if (!this.canShoot) return;
    
    const bullet = this.bullets.get(this.player.x, this.player.y - 20, 'bullet');
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
      
      this.canShoot = false;
      this.time.delayedCall(this.shootCooldown, () => {
        this.canShoot = true;
      });
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
    
    // 射击
    if (this.spaceKey.isDown) {
      this.shoot();
    }
    
    // 清理超出屏幕的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < -10) {
        bullet.destroy();
      }
    });
    
    // 清理超出屏幕的敌人（失败条件）
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active && enemy.y > 610) {
        enemy.destroy();
        this.enemiesRemaining--;
        this.updateUI();
        
        if (this.enemiesRemaining <= 0) {
          this.time.delayedCall(2000, () => {
            this.startNextWave();
          });
        }
      }
    });
  }

  // 确定性随机数生成器
  createSeededRandom(seed) {
    let state = seed;
    return function() {
      state = (state * 9301 + 49297) % 233280;
      return state / 233280;
    };
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000',
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