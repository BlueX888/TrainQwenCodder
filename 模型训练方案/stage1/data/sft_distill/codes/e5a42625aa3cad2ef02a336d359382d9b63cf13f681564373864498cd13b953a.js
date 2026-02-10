class EndlessWaveScene extends Phaser.Scene {
  constructor() {
    super('EndlessWaveScene');
    
    // 游戏状态变量（可验证）
    this.currentWave = 1;
    this.killCount = 0;
    this.enemiesInWave = 0;
    this.enemiesAlive = 0;
    this.baseEnemySpeed = 80;
    this.isWaveActive = false;
    
    // 随机种子（确定性）
    this.rng = null;
  }
  
  preload() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillTriangle(0, -15, -10, 15, 10, 15);
    playerGraphics.generateTexture('player', 20, 30);
    playerGraphics.destroy();
    
    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(10, 10, 10);
    enemyGraphics.generateTexture('enemy', 20, 20);
    enemyGraphics.destroy();
    
    // 创建子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(3, 3, 3);
    bulletGraphics.generateTexture('bullet', 6, 6);
    bulletGraphics.destroy();
  }
  
  create() {
    // 初始化随机数生成器（固定种子）
    this.rng = new Phaser.Math.RandomDataGenerator(['ENDLESS_WAVE']);
    
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
    
    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 射击冷却
    this.canShoot = true;
    this.shootCooldown = 200;
    
    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.playerHit, null, this);
    
    // UI 文本
    this.waveText = this.add.text(16, 16, 'Wave: 1', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    this.killText = this.add.text(16, 50, 'Kills: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    this.statusText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setVisible(false);
    
    // 开始第一波
    this.startWave();
  }
  
  update(time, delta) {
    if (!this.player.active) return;
    
    // 玩家移动
    this.player.setVelocity(0);
    
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300);
    }
    
    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-300);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(300);
    }
    
    // 射击
    if (this.spaceKey.isDown && this.canShoot) {
      this.shoot();
    }
    
    // 清理越界子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < -10) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });
    
    // 检查波次是否完成
    if (this.isWaveActive && this.enemiesAlive === 0) {
      this.completeWave();
    }
  }
  
  startWave() {
    this.isWaveActive = true;
    
    // 计算本波敌人数量和速度
    this.enemiesInWave = 5 + (this.currentWave - 1);
    const enemySpeed = this.baseEnemySpeed + (this.currentWave - 1) * 10;
    this.enemiesAlive = this.enemiesInWave;
    
    // 显示波次开始提示
    this.statusText.setText(`Wave ${this.currentWave} Start!`);
    this.statusText.setVisible(true);
    
    this.time.delayedCall(1000, () => {
      this.statusText.setVisible(false);
    });
    
    // 生成敌人
    for (let i = 0; i < this.enemiesInWave; i++) {
      this.time.delayedCall(i * 500, () => {
        this.spawnEnemy(enemySpeed);
      });
    }
    
    // 更新 UI
    this.waveText.setText(`Wave: ${this.currentWave}`);
  }
  
  spawnEnemy(speed) {
    // 从对象池获取或创建敌人
    let enemy = this.enemies.get();
    
    if (!enemy) {
      enemy = this.enemies.create(0, 0, 'enemy');
    }
    
    // 随机 X 位置
    const x = this.rng.between(50, 750);
    enemy.setPosition(x, -20);
    enemy.setActive(true);
    enemy.setVisible(true);
    enemy.body.enable = true;
    
    // 设置速度（向下移动，带有轻微横向偏移）
    const xVelocity = this.rng.between(-30, 30);
    enemy.setVelocity(xVelocity, speed);
    
    // 敌人离开屏幕底部时回收
    enemy.setData('checkBounds', true);
  }
  
  shoot() {
    this.canShoot = false;
    
    // 从对象池获取子弹
    let bullet = this.bullets.get();
    
    if (!bullet) {
      bullet = this.bullets.create(0, 0, 'bullet');
    }
    
    bullet.setPosition(this.player.x, this.player.y - 20);
    bullet.setActive(true);
    bullet.setVisible(true);
    bullet.body.enable = true;
    bullet.setVelocityY(-500);
    
    // 射击冷却
    this.time.delayedCall(this.shootCooldown, () => {
      this.canShoot = true;
    });
  }
  
  hitEnemy(bullet, enemy) {
    // 回收子弹和敌人
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.enable = false;
    
    enemy.setActive(false);
    enemy.setVisible(false);
    enemy.body.enable = false;
    
    // 更新击杀数
    this.killCount++;
    this.enemiesAlive--;
    this.killText.setText(`Kills: ${this.killCount}`);
    
    // 创建击杀特效
    const explosion = this.add.graphics();
    explosion.fillStyle(0xff8800, 1);
    explosion.fillCircle(enemy.x, enemy.y, 15);
    
    this.tweens.add({
      targets: explosion,
      alpha: 0,
      scale: 2,
      duration: 300,
      onComplete: () => {
        explosion.destroy();
      }
    });
  }
  
  playerHit(player, enemy) {
    // 游戏结束
    player.setActive(false);
    player.setVisible(false);
    
    this.isWaveActive = false;
    
    // 停止所有敌人
    this.enemies.children.entries.forEach(e => {
      if (e.active) {
        e.setVelocity(0);
      }
    });
    
    // 显示游戏结束
    this.statusText.setText(`Game Over!\nWave: ${this.currentWave}\nKills: ${this.killCount}`);
    this.statusText.setVisible(true);
    
    // 重启游戏
    this.time.delayedCall(3000, () => {
      this.scene.restart();
    });
  }
  
  completeWave() {
    this.isWaveActive = false;
    
    // 显示波次完成
    this.statusText.setText(`Wave ${this.currentWave} Complete!`);
    this.statusText.setVisible(true);
    
    // 准备下一波
    this.currentWave++;
    
    this.time.delayedCall(2000, () => {
      this.statusText.setVisible(false);
      this.startWave();
    });
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000033',
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

// 导出状态用于验证
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    currentWave: scene.currentWave,
    killCount: scene.killCount,
    enemiesInWave: scene.enemiesInWave,
    enemiesAlive: scene.enemiesAlive,
    isWaveActive: scene.isWaveActive
  };
};