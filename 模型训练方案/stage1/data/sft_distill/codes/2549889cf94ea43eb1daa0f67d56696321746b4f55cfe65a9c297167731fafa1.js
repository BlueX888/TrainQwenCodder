// 全局数据管理
class GameData {
  constructor() {
    this.reset();
  }
  
  reset() {
    this.currentLevel = 1;
    this.maxLevel = 15;
    this.totalTime = 0;
    this.levelStartTime = 0;
    this.isGameOver = false;
    this.isSuccess = false;
  }
}

const gameData = new GameData();

// 主菜单场景
class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, width, height);
    
    // 标题
    const title = this.add.text(width / 2, height / 3, '限时挑战', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);
    
    // 说明
    const info = this.add.text(width / 2, height / 2, 
      '15关挑战\n每关限时1秒\n点击目标通关\n超时即失败', {
      fontSize: '24px',
      color: '#16c8bb',
      align: 'center',
      lineSpacing: 10
    });
    info.setOrigin(0.5);
    
    // 开始按钮
    const startButton = this.add.graphics();
    startButton.fillStyle(0xe94560, 1);
    startButton.fillRoundedRect(width / 2 - 100, height * 2 / 3, 200, 60, 10);
    
    const startText = this.add.text(width / 2, height * 2 / 3 + 30, '开始游戏', {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    startText.setOrigin(0.5);
    
    // 点击开始
    const buttonZone = this.add.zone(width / 2, height * 2 / 3 + 30, 200, 60);
    buttonZone.setInteractive({ useHandCursor: true });
    buttonZone.on('pointerdown', () => {
      gameData.reset();
      this.scene.start('GameScene');
    });
    
    // 悬停效果
    buttonZone.on('pointerover', () => {
      startButton.clear();
      startButton.fillStyle(0xff6b7a, 1);
      startButton.fillRoundedRect(width / 2 - 100, height * 2 / 3, 200, 60, 10);
    });
    
    buttonZone.on('pointerout', () => {
      startButton.clear();
      startButton.fillStyle(0xe94560, 1);
      startButton.fillRoundedRect(width / 2 - 100, height * 2 / 3, 200, 60, 10);
    });
  }
}

// 游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x0f3460, 1);
    bg.fillRect(0, 0, width, height);
    
    // 关卡信息
    this.levelText = this.add.text(20, 20, `关卡: ${gameData.currentLevel}/${gameData.maxLevel}`, {
      fontSize: '24px',
      color: '#ffffff'
    });
    
    // 倒计时显示
    this.timerText = this.add.text(width - 20, 20, '剩余: 1.00s', {
      fontSize: '24px',
      color: '#16c8bb'
    });
    this.timerText.setOrigin(1, 0);
    
    // 总用时显示
    this.totalTimeText = this.add.text(width / 2, 20, `总用时: ${gameData.totalTime.toFixed(2)}s`, {
      fontSize: '20px',
      color: '#ffd700'
    });
    this.totalTimeText.setOrigin(0.5, 0);
    
    // 创建目标（随机位置）
    this.createTarget();
    
    // 记录关卡开始时间
    gameData.levelStartTime = this.time.now;
    
    // 创建倒计时定时器（1秒）
    this.levelTimer = this.time.addEvent({
      delay: 1000,
      callback: this.onTimeUp,
      callbackScope: this,
      loop: false
    });
    
    // 剩余时间（毫秒）
    this.remainingTime = 1000;
  }

  createTarget() {
    const { width, height } = this.cameras.main;
    
    // 随机位置（避免太靠边）
    const margin = 80;
    const x = Phaser.Math.Between(margin, width - margin);
    const y = Phaser.Math.Between(100, height - margin);
    
    // 绘制目标
    this.target = this.add.graphics();
    this.target.fillStyle(0xe94560, 1);
    this.target.fillCircle(0, 0, 30);
    this.target.lineStyle(4, 0xffffff, 1);
    this.target.strokeCircle(0, 0, 30);
    this.target.setPosition(x, y);
    
    // 添加交互
    const targetZone = this.add.zone(x, y, 60, 60);
    targetZone.setInteractive({ useHandCursor: true });
    targetZone.on('pointerdown', () => {
      this.onTargetClicked();
    });
    
    // 脉冲动画
    this.tweens.add({
      targets: this.target,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
  }

  onTargetClicked() {
    // 计算本关用时
    const levelTime = (this.time.now - gameData.levelStartTime) / 1000;
    gameData.totalTime += levelTime;
    
    // 移除定时器
    if (this.levelTimer) {
      this.levelTimer.remove();
    }
    
    // 检查是否通关
    if (gameData.currentLevel >= gameData.maxLevel) {
      gameData.isSuccess = true;
      gameData.isGameOver = true;
      this.scene.start('EndScene');
    } else {
      // 进入下一关
      gameData.currentLevel++;
      this.scene.restart();
    }
  }

  onTimeUp() {
    // 超时失败
    gameData.isGameOver = true;
    gameData.isSuccess = false;
    this.scene.start('EndScene');
  }

  update(time, delta) {
    if (gameData.isGameOver) return;
    
    // 更新剩余时间显示
    this.remainingTime = Math.max(0, 1000 - (time - gameData.levelStartTime));
    const seconds = (this.remainingTime / 1000).toFixed(2);
    this.timerText.setText(`剩余: ${seconds}s`);
    
    // 时间不足时变红
    if (this.remainingTime < 300) {
      this.timerText.setColor('#ff0000');
    } else {
      this.timerText.setColor('#16c8bb');
    }
    
    // 更新总用时
    const currentTotal = gameData.totalTime + (time - gameData.levelStartTime) / 1000;
    this.totalTimeText.setText(`总用时: ${currentTotal.toFixed(2)}s`);
  }
}

// 结束场景
class EndScene extends Phaser.Scene {
  constructor() {
    super('EndScene');
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // 背景
    const bg = this.add.graphics();
    if (gameData.isSuccess) {
      bg.fillStyle(0x1a472a, 1); // 成功：绿色背景
    } else {
      bg.fillStyle(0x4a1a1a, 1); // 失败：红色背景
    }
    bg.fillRect(0, 0, width, height);
    
    // 结果标题
    const resultTitle = this.add.text(width / 2, height / 3, 
      gameData.isSuccess ? '挑战成功！' : '挑战失败！', {
      fontSize: '48px',
      color: gameData.isSuccess ? '#00ff00' : '#ff0000',
      fontStyle: 'bold'
    });
    resultTitle.setOrigin(0.5);
    
    // 统计信息
    let statsText = '';
    if (gameData.isSuccess) {
      statsText = `完成关卡: ${gameData.maxLevel}/${gameData.maxLevel}\n总用时: ${gameData.totalTime.toFixed(2)}秒\n平均每关: ${(gameData.totalTime / gameData.maxLevel).toFixed(2)}秒`;
    } else {
      statsText = `完成关卡: ${gameData.currentLevel - 1}/${gameData.maxLevel}\n失败于第 ${gameData.currentLevel} 关`;
    }
    
    const stats = this.add.text(width / 2, height / 2, statsText, {
      fontSize: '24px',
      color: '#ffffff',
      align: 'center',
      lineSpacing: 10
    });
    stats.setOrigin(0.5);
    
    // 重新开始按钮
    const restartButton = this.add.graphics();
    restartButton.fillStyle(0x16c8bb, 1);
    restartButton.fillRoundedRect(width / 2 - 100, height * 2 / 3, 200, 60, 10);
    
    const restartText = this.add.text(width / 2, height * 2 / 3 + 30, '重新开始', {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    restartText.setOrigin(0.5);
    
    // 返回菜单按钮
    const menuButton = this.add.graphics();
    menuButton.fillStyle(0x666666, 1);
    menuButton.fillRoundedRect(width / 2 - 100, height * 2 / 3 + 80, 200, 60, 10);
    
    const menuText = this.add.text(width / 2, height * 2 / 3 + 110, '返回菜单', {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    menuText.setOrigin(0.5);
    
    // 重新开始交互
    const restartZone = this.add.zone(width / 2, height * 2 / 3 + 30, 200, 60);
    restartZone.setInteractive({ useHandCursor: true });
    restartZone.on('pointerdown', () => {
      gameData.reset();
      this.scene.start('GameScene');
    });
    
    // 返回菜单交互
    const menuZone = this.add.zone(width / 2, height * 2 / 3 + 110, 200, 60);
    menuZone.setInteractive({ useHandCursor: true });
    menuZone.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
    
    // 悬停效果
    restartZone.on('pointerover', () => {
      restartButton.clear();
      restartButton.fillStyle(0x20d8c8, 1);
      restartButton.fillRoundedRect(width / 2 - 100, height * 2 / 3, 200, 60, 10);
    });
    
    restartZone.on('pointerout', () => {
      restartButton.clear();
      restartButton.fillStyle(0x16c8bb, 1);
      restartButton.fillRoundedRect(width / 2 - 100, height * 2 / 3, 200, 60, 10);
    });
    
    menuZone.on('pointerover', () => {
      menuButton.clear();
      menuButton.fillStyle(0x888888, 1);
      menuButton.fillRoundedRect(width / 2 - 100, height * 2 / 3 + 80, 200, 60, 10);
    });
    
    menuZone.on('pointerout', () => {
      menuButton.clear();
      menuButton.fillStyle(0x666666, 1);
      menuButton.fillRoundedRect(width / 2 - 100, height * 2 / 3 + 80, 200, 60, 10);
    });
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: [MenuScene, GameScene, EndScene]
};

new Phaser.Game(config);