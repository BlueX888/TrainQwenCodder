class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentWave = 0;
    this.enemiesPerWave = 3;
    this.enemySpeed = 80;
    this.waveDelay = 2000; // 2秒
    this.isWaveActive = false;
    this.totalEnemiesKilled = 0;
  }

  preload() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（橙色圆形）
    const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    enemyGraphics.fillStyle(0xff8800, 1);
    enemyGraphics.fillCircle(15, 15, 15);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建子弹纹理（黄色小方块）
    const bulletGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillRect(0, 0, 5, 10);
    bulletGraphics.generateTexture('bullet', 5, 10);
    bulletGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20
    });

    // 添加碰撞检测
    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
    this.lastFired = 0;

    // 显示波次文本
    this.waveText = this.add.text(16, 16, 'Wave: 0', {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    // 显示敌人计数
    this.enemyCountText = this.add.text(16, 56, 'Enemies: 0/0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    // 显示总击杀数
    this.killCountText = this.add.text(16, 96, 'Total Kills: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    // 显示状态文本
    this.statusText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 开始第一波
    this.startNextWave();
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

    // 发射子弹
    if (this.spaceKey.isDown && time > this.lastFired + 200) {
      this.fireBullet();
      this.lastFired = time;
    }

    // 清理超出屏幕的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < -10) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 清理超出屏幕的敌人（视为逃脱）
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active && enemy.y > 610) {
        enemy.destroy();
        this.checkWaveComplete();
      }
    });

    // 更新敌人计数显示
    const activeEnemies = this.enemies.countActive(true);
    this.enemyCountText.setText(
      `Enemies: ${activeEnemies}/${this.enemiesPerWave}`
    );
  }

  startNextWave() {
    this.currentWave++;
    this.isWaveActive = true;
    this.waveText.setText(`Wave: ${this.currentWave}`);
    
    // 显示波次开始提示
    this.statusText.setText(`Wave ${this.currentWave} Start!`);
    this.statusText.setAlpha(1);
    
    // 淡出提示文本
    this.tweens.add({
      targets: this.statusText,
      alpha: 0,
      duration: 1500,
      ease: 'Power2'
    });

    // 生成敌人
    this.spawnEnemies();
  }

  spawnEnemies() {
    // 使用固定间隔生成敌人，确保确定性
    const spacing = 200;
    const startX = 400 - (this.enemiesPerWave - 1) * spacing / 2;

    for (let i = 0; i < this.enemiesPerWave; i++) {
      const x = startX + i * spacing;
      const y = -30;
      
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setVelocityY(this.enemySpeed);
      
      // 添加轻微的左右摆动（确定性）
      const swayDirection = (i % 2 === 0) ? 1 : -1;
      enemy.setData('swayPhase', i * Math.PI / 3);
      enemy.setData('swayDirection', swayDirection);
    }
  }

  fireBullet() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
    }
  }

  hitEnemy(bullet, enemy) {
    // 销毁子弹和敌人
    bullet.setActive(false);
    bullet.setVisible(false);
    enemy.destroy();

    // 增加击杀计数
    this.totalEnemiesKilled++;
    this.killCountText.setText(`Total Kills: ${this.totalEnemiesKilled}`);

    // 检查波次是否完成
    this.checkWaveComplete();
  }

  checkWaveComplete() {
    // 检查是否还有活跃的敌人
    const activeEnemies = this.enemies.countActive(true);
    
    if (activeEnemies === 0 && this.isWaveActive) {
      this.isWaveActive = false;
      
      // 显示波次完成提示
      this.statusText.setText(`Wave ${this.currentWave} Complete!`);
      this.statusText.setAlpha(1);
      
      // 淡出提示
      this.tweens.add({
        targets: this.statusText,
        alpha: 0,
        duration: 1500,
        ease: 'Power2'
      });

      // 2秒后开始下一波
      this.time.addEvent({
        delay: this.waveDelay,
        callback: this.startNextWave,
        callbackScope: this,
        loop: false
      });
    }
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
  scene: GameScene
};

// 创建游戏实例
const game = new Phaser.Game(config);