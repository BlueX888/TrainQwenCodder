class EndlessWaveScene extends Phaser.Scene {
  constructor() {
    super('EndlessWaveScene');
    
    // 游戏状态
    this.currentWave = 0;
    this.killCount = 0;
    this.enemiesInWave = 0;
    this.enemiesRemaining = 0;
    this.baseEnemySpeed = 300;
    this.waveInProgress = false;
    
    // 随机种子（可配置）
    this.seed = 12345;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建纹理
    this.createTextures();
    
    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);
    
    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20
    });
    
    // 创建敌人组
    this.enemies = this.physics.add.group({
      defaultKey: 'enemy',
      maxSize: 50
    });
    
    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastFireTime = 0;
    this.fireRate = 200; // 毫秒
    
    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.bulletHitEnemy, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.playerHitEnemy, null, this);
    
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

  createTextures() {
    // 玩家纹理（蓝色三角形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillTriangle(16, 0, 0, 32, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();
    
    // 敌人纹理（红色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
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
    this.enemiesInWave = 2 + this.currentWave; // 从第1波3个敌人开始
    this.enemiesRemaining = this.enemiesInWave;
    this.waveInProgress = true;
    
    // 更新 UI
    this.waveText.setText(`Wave: ${this.currentWave}`);
    this.enemyCountText.setText(`Enemies: ${this.enemiesRemaining}`);
    
    // 显示波次开始提示
    this.statusText.setText(`Wave ${this.currentWave} - ${this.enemiesInWave} Enemies!`);
    this.time.delayedCall(2000, () => {
      this.statusText.setText('');
    });
    
    // 生成敌人
    this.spawnWaveEnemies();
  }

  spawnWaveEnemies() {
    const enemySpeed = this.baseEnemySpeed + (this.currentWave - 1) * 20; // 每波速度增加20
    const spawnDelay = 1000; // 每个敌人生成间隔1秒
    
    for (let i = 0; i < this.enemiesInWave; i++) {
      this.time.delayedCall(i * spawnDelay, () => {
        this.spawnEnemy(enemySpeed);
      });
    }
  }

  spawnEnemy(speed) {
    // 使用伪随机数生成器（基于种子）
    this.seed = (this.seed * 9301 + 49297) % 233280;
    const random = this.seed / 233280;
    
    const x = 50 + random * 700; // 在顶部随机位置生成
    const enemy = this.enemies.get(x, -50, 'enemy');
    
    if (enemy) {
      enemy.setActive(true);
      enemy.setVisible(true);
      enemy.body.enable = true;
      enemy.setVelocityY(speed);
      
      // 添加随机左右移动
      const randomHorizontal = (random - 0.5) * 100;
      enemy.setVelocityX(randomHorizontal);
      enemy.setBounce(1, 0);
      enemy.setCollideWorldBounds(true);
    }
  }

  bulletHitEnemy(bullet, enemy) {
    // 子弹击中敌人
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.enable = false;
    
    enemy.setActive(false);
    enemy.setVisible(false);
    enemy.body.enable = false;
    
    // 更新统计
    this.killCount++;
    this.enemiesRemaining--;
    
    this.killText.setText(`Kills: ${this.killCount}`);
    this.enemyCountText.setText(`Enemies: ${this.enemiesRemaining}`);
    
    // 检查波次是否完成
    if (this.enemiesRemaining <= 0 && this.waveInProgress) {
      this.waveInProgress = false;
      this.statusText.setText('Wave Complete!');
      
      // 延迟3秒后开始下一波
      this.time.delayedCall(3000, () => {
        this.startNextWave();
      });
    }
  }

  playerHitEnemy(player, enemy) {
    // 玩家被敌人击中
    enemy.setActive(false);
    enemy.setVisible(false);
    enemy.body.enable = false;
    
    this.enemiesRemaining--;
    this.enemyCountText.setText(`Enemies: ${this.enemiesRemaining}`);
    
    // 玩家闪烁效果
    this.tweens.add({
      targets: player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 3
    });
    
    // 检查波次是否完成
    if (this.enemiesRemaining <= 0 && this.waveInProgress) {
      this.waveInProgress = false;
      this.statusText.setText('Wave Complete!');
      
      this.time.delayedCall(3000, () => {
        this.startNextWave();
      });
    }
  }

  fireBullet() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 20, 'bullet');
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.enable = true;
      bullet.setVelocityY(-500);
      
      // 子弹超出屏幕后回收
      this.time.delayedCall(2000, () => {
        if (bullet.active) {
          bullet.setActive(false);
          bullet.setVisible(false);
          bullet.body.enable = false;
        }
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
    if (this.spaceKey.isDown && time > this.lastFireTime + this.fireRate) {
      this.fireBullet();
      this.lastFireTime = time;
    }
    
    // 清理超出屏幕的敌人
    this.enemies.children.each((enemy) => {
      if (enemy.active && enemy.y > 650) {
        enemy.setActive(false);
        enemy.setVisible(false);
        enemy.body.enable = false;
        
        this.enemiesRemaining--;
        this.enemyCountText.setText(`Enemies: ${this.enemiesRemaining}`);
        
        // 检查波次是否完成
        if (this.enemiesRemaining <= 0 && this.waveInProgress) {
          this.waveInProgress = false;
          this.statusText.setText('Wave Complete!');
          
          this.time.delayedCall(3000, () => {
            this.startNextWave();
          });
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

// 启动游戏
const game = new Phaser.Game(config);