const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 可验证信号
window.__signals__ = {
  skillW: { cooldown: 0, totalCasts: 0, lastCastTime: 0 },
  skillA: { cooldown: 0, totalCasts: 0, lastCastTime: 0 },
  skillS: { cooldown: 0, totalCasts: 0, lastCastTime: 0 },
  skillD: { cooldown: 0, totalCasts: 0, lastCastTime: 0 }
};

let skills = {};
let graphics;
let infoText;
let cooldownTimers = {};

function preload() {
  // 无需预加载外部资源
}

function create() {
  graphics = this.add.graphics();
  
  // 初始化四个技能
  const skillKeys = ['W', 'A', 'S', 'D'];
  const positions = [
    { x: 200, y: 300 }, // W
    { x: 100, y: 400 }, // A
    { x: 200, y: 400 }, // S
    { x: 300, y: 400 }  // D
  ];
  
  skillKeys.forEach((key, index) => {
    skills[key] = {
      key: key,
      x: positions[index].x,
      y: positions[index].y,
      cooldown: 0,
      maxCooldown: 3000, // 3秒冷却
      isReady: true,
      keyObj: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[key])
    };
  });
  
  // 创建说明文本
  infoText = this.add.text(500, 100, '', {
    fontSize: '18px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 创建标题
  this.add.text(400, 50, 'Orange Skill Cooldown System', {
    fontSize: '28px',
    fill: '#ff8800',
    fontFamily: 'Arial'
  }).setOrigin(0.5);
  
  this.add.text(400, 90, 'Press W/A/S/D to cast skills (3s cooldown)', {
    fontSize: '16px',
    fill: '#aaaaaa',
    fontFamily: 'Arial'
  }).setOrigin(0.5);
  
  // 监听按键
  Object.values(skills).forEach(skill => {
    skill.keyObj.on('down', () => {
      castSkill.call(this, skill);
    });
  });
}

function castSkill(skill) {
  if (!skill.isReady) {
    console.log(`Skill ${skill.key} is on cooldown!`);
    return;
  }
  
  // 释放技能
  skill.isReady = false;
  skill.cooldown = skill.maxCooldown;
  
  // 更新信号
  const signalKey = 'skill' + skill.key;
  window.__signals__[signalKey].totalCasts++;
  window.__signals__[signalKey].lastCastTime = Date.now();
  window.__signals__[signalKey].cooldown = skill.maxCooldown;
  
  console.log(JSON.stringify({
    event: 'skill_cast',
    skill: skill.key,
    timestamp: Date.now(),
    totalCasts: window.__signals__[signalKey].totalCasts
  }));
  
  // 创建技能释放效果
  const effect = this.add.graphics();
  effect.fillStyle(0xff8800, 0.6);
  effect.fillCircle(skill.x, skill.y, 40);
  
  // 效果动画
  this.tweens.add({
    targets: effect,
    alpha: 0,
    scale: 2,
    duration: 500,
    onComplete: () => {
      effect.destroy();
    }
  });
  
  // 启动冷却计时器
  if (cooldownTimers[skill.key]) {
    cooldownTimers[skill.key].remove();
  }
  
  cooldownTimers[skill.key] = this.time.addEvent({
    delay: 100, // 每100ms更新一次
    callback: () => {
      skill.cooldown = Math.max(0, skill.cooldown - 100);
      window.__signals__[signalKey].cooldown = skill.cooldown;
      
      if (skill.cooldown <= 0) {
        skill.isReady = true;
        cooldownTimers[skill.key].remove();
        console.log(JSON.stringify({
          event: 'skill_ready',
          skill: skill.key,
          timestamp: Date.now()
        }));
      }
    },
    loop: true
  });
}

function update(time, delta) {
  // 清除之前的绘制
  graphics.clear();
  
  // 绘制每个技能
  Object.values(skills).forEach(skill => {
    const size = 60;
    const x = skill.x;
    const y = skill.y;
    
    // 绘制技能框背景
    graphics.fillStyle(0x444444, 1);
    graphics.fillRoundedRect(x - size/2, y - size/2, size, size, 8);
    
    // 绘制技能图标（橙色方块）
    if (skill.isReady) {
      graphics.fillStyle(0xff8800, 1);
    } else {
      graphics.fillStyle(0x885500, 0.5);
    }
    graphics.fillRoundedRect(x - size/2 + 5, y - size/2 + 5, size - 10, size - 10, 4);
    
    // 绘制按键提示
    graphics.fillStyle(0xffffff, 1);
    const textMetrics = { width: 12, height: 16 }; // 估算文字尺寸
    graphics.fillText = function() {}; // Graphics没有fillText，需要用Text对象
    
    // 使用临时Text对象绘制按键
    const keyText = this.add.text(x, y, skill.key, {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // 绘制冷却遮罩
    if (!skill.isReady) {
      const progress = skill.cooldown / skill.maxCooldown;
      const maskHeight = size * progress;
      
      graphics.fillStyle(0x000000, 0.7);
      graphics.fillRoundedRect(
        x - size/2,
        y - size/2,
        size,
        maskHeight,
        8
      );
      
      // 绘制冷却时间文本
      const cooldownText = this.add.text(x, y + size/2 + 15, 
        (skill.cooldown / 1000).toFixed(1) + 's', {
        fontSize: '14px',
        fill: '#ff8800',
        fontFamily: 'Arial'
      }).setOrigin(0.5);
    }
    
    // 绘制进度条
    const barWidth = size;
    const barHeight = 6;
    const barY = y + size/2 + 35;
    
    // 进度条背景
    graphics.fillStyle(0x333333, 1);
    graphics.fillRoundedRect(x - barWidth/2, barY, barWidth, barHeight, 3);
    
    // 进度条前景
    if (!skill.isReady) {
      const progress = 1 - (skill.cooldown / skill.maxCooldown);
      graphics.fillStyle(0xff8800, 1);
      graphics.fillRoundedRect(x - barWidth/2, barY, barWidth * progress, barHeight, 3);
    } else {
      graphics.fillStyle(0x00ff00, 1);
      graphics.fillRoundedRect(x - barWidth/2, barY, barWidth, barHeight, 3);
    }
  });
  
  // 更新信息文本
  let info = 'Skill Status:\n\n';
  Object.values(skills).forEach(skill => {
    const signalKey = 'skill' + skill.key;
    const status = skill.isReady ? 'READY' : `CD: ${(skill.cooldown/1000).toFixed(1)}s`;
    info += `[${skill.key}] ${status} (Casts: ${window.__signals__[signalKey].totalCasts})\n`;
  });
  infoText.setText(info);
}

new Phaser.Game(config);